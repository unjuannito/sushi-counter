import { useEffect, useRef, useState } from "react";
import { useUserTournaments } from "./useUserTournaments";
import { useCalendar } from "./useCalendar";
import { APP_CONSTANTS } from "~/utils/constants";

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

                if (timeSinceLastUpdate > APP_CONSTANTS.NEW_SESSION_THRESHOLD_MS) {
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
            }, APP_CONSTANTS.SAVE_DELAY_MS);

            return newCount;
        });
    };

    const callServices = (newCount: number, newCreatedAt: Date, newUpdatedAt: Date) => {
        const timeSinceLastUpdate = newUpdatedAt.getTime() - (new Date(updatedAt)).getTime();
        console.log("timeSinceLastUpdate", timeSinceLastUpdate);

        // If a long time has passed (> 3h) or if we are starting a new session (it was at 0 and now there is sushi)
        // But we only update createdAt if APP_CONSTANTS.SHORT_SESSION_THRESHOLD_MS has passed since the last change,
        // to avoid accidental resets if it is set to 0 by error and then quickly increased.
        const isNewSessionAfterTimeout = timeSinceLastUpdate > APP_CONSTANTS.NEW_SESSION_THRESHOLD_MS;
        const isNewSessionFromZero = (oldCountRef.current === 0 && newCount > 0) && (timeSinceLastUpdate > APP_CONSTANTS.SHORT_SESSION_THRESHOLD_MS);

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
