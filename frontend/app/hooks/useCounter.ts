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
                setCount(sushiCounter.count);
                setCreatedAt(sushiCounter.createdAt);
                setUpdatedAt(sushiCounter.updatedAt);
            }
        } else {
            localStorage.setItem(
                "sushiCounter",
                JSON.stringify({ count, createdAt, updatedAt })
            );
        }
    }, []);

    const modifyCounter = (mod: number) => {
        const now = Date.now();
        const newCount = count + mod;

        if (!debounceTimeoutRef.current) {
            oldCountRef.current = count;
        }
        setCount(newCount);
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            const updatedAtNow = Date.now();
            callServices(newCount, new Date(createdAt), new Date(updatedAtNow));
        }, SAVE_DELAY_MS);
    };

    const callServices = (newCount: number, newCreatedAt: Date, newUpdatedAt: Date) => {
        const timeSinceLastUpdate = newUpdatedAt.getTime() - (new Date(updatedAt)).getTime();
        console.log("timeSinceLastUpdate", timeSinceLastUpdate);
        // se va crear uno nuevo
        if (timeSinceLastUpdate > NEW_SESSION_THRESHOLD_MS || (timeSinceLastUpdate > SHORT_SESSION_THRESHOLD_MS && oldCountRef.current === 0)) {
            console.log("Creating new session");
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
