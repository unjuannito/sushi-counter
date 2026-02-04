import { useEffect, useRef, useState } from "react";
import { useUserTournaments } from "./useUserTournaments";
import { useCalendar } from "./useCalendar";
import { NEW_SESSION_THRESHOLD_MS, SAVE_DELAY_MS, SESSION_TIMEOUT_MS, SHORT_SESSION_THRESHOLD_MS } from "~/utils/constants";

export default function useCounter() {
    const [count, setCount] = useState<number>(0);
    const [createdAt, setCreatedAt] = useState<Date>(new Date());
    const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
    const { isAnyTournamentActive, updateSushiCount } = useUserTournaments();
    const { upsertLog } = useCalendar();
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const oldCountRef = useRef<number | null>(null);
    useEffect(() => {
        const stored = localStorage.getItem("sushiCounter");
        if (stored) {
            const sushiCounter = JSON.parse(stored);
            if (
                sushiCounter.count !== undefined &&
                sushiCounter.createdAt !== undefined &&
                sushiCounter.updatedAt !== undefined
            ) {
                const now = new Date();
                const lastUpdate = new Date(sushiCounter.updatedAt);
                const timeSinceLastUpdate = now.getTime() - lastUpdate.getTime();

                if (timeSinceLastUpdate > NEW_SESSION_THRESHOLD_MS) {
                    console.log("New session threshold exceeded, resetting counter");
                    const newCreatedAt = new Date();
                    const newUpdatedAt = new Date();
                    setCount(0);
                    setCreatedAt(newCreatedAt);
                    setUpdatedAt(newUpdatedAt);
                    localStorage.setItem(
                        "sushiCounter",
                        JSON.stringify({ count: 0, createdAt: newCreatedAt, updatedAt: newUpdatedAt })
                    );
                } else {
                    setCount(sushiCounter.count);
                    setCreatedAt(new Date(sushiCounter.createdAt));
                    setUpdatedAt(new Date(sushiCounter.updatedAt));
                }
            }
        } else {
            localStorage.setItem(
                "sushiCounter",
                JSON.stringify({ count, createdAt, updatedAt })
            );
        }
    }, []);

    const modifyCounter = (mod: number) => {
        setCount((prevCount) => {
            const newCount = prevCount + mod;
            
            if (!debounceTimeoutRef.current) {
                oldCountRef.current = prevCount;
            }

            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
                const updatedAtNow = Date.now();
                callServices(newCount, new Date(createdAt), new Date(updatedAtNow));
                debounceTimeoutRef.current = null; // Reset ref after execution
            }, SAVE_DELAY_MS);

            return newCount;
        });
    };

    const callServices = (newCount: number, newCreatedAt: Date, newUpdatedAt: Date) => {
        const timeSinceLastUpdate = newUpdatedAt.getTime() - (new Date(updatedAt)).getTime();
        console.log("timeSinceLastUpdate", timeSinceLastUpdate);

        // Si ha pasado mucho tiempo (> 3h) o si empezamos una sesión nueva (estaba en 0 y ahora hay sushi)
        // Pero solo actualizamos createdAt si ha pasado el SHORT_SESSION_THRESHOLD_MS desde el último cambio,
        // para evitar reinicios accidentales si se pone a 0 por error y se vuelve a subir rápido.
        const isNewSessionAfterTimeout = timeSinceLastUpdate > NEW_SESSION_THRESHOLD_MS;
        const isNewSessionFromZero = (oldCountRef.current === 0 && newCount > 0) && (timeSinceLastUpdate > SHORT_SESSION_THRESHOLD_MS);

        if (isNewSessionAfterTimeout || isNewSessionFromZero) {
            console.log("Starting new session (threshold reached)");
            setCreatedAt(newUpdatedAt);
            newCreatedAt = newUpdatedAt;
        }

        if (isAnyTournamentActive()) {
            updateSushiCount(newCount);
        }
        upsertLog(newCount, new Date(newCreatedAt), new Date(newUpdatedAt));

        localStorage.setItem(
            "sushiCounter",
            JSON.stringify({
                count: newCount,
                createdAt: newCreatedAt,
                updatedAt: newUpdatedAt,
            })
        );

    }
    return { count, modifyCounter };

}
