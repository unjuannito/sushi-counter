import { use, useEffect, useState } from "react";
import { CalendarService } from "~/services/calendarService";
import type { Logs } from "~/types/calendarType";
import { useAuth } from "./useAuth";

export function useCalendar() {
    const { user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState({ month: new Date().getMonth()+1, year: new Date().getFullYear() });
    const [logs, setLogs] = useState<Logs>([]);
    const [error, setError] = useState<string | null>(null);
    const service = new CalendarService();


    useEffect(() => {
        if (!user) return;
        service.getLogs(user.code)
            .then((response) => {
                if (!response.success) {
                    setError(response.errorMessage || 'Error fetching logs');
                    return;
                }
                setLogs(response.logs || []);
            })
            .catch((err) => {
                setError(err.message || 'Error fetching logs');
            });
    }, [user]);

    const upsertLog = async (sushiCount: number, createdAt: Date, updatedAt: Date) => {
        if (!user) return;
        const response = await service.upsertLog(user.code, sushiCount, createdAt.toISOString(), updatedAt.toISOString());
        if (!response.success) {
            setError(response.errorMessage || 'Error upserting log');
            return;
        }
        if (response.logs) {
        setLogs(response.logs);
        }
    };

    const changeMonth = (month: string) => {
        console.log(month);
        const [yearPart, monthPart] = month.split("-");
        setCurrentMonth({ month: Number(monthPart), year: Number(yearPart) });
    };

    return { logs, currentMonth, upsertLog, error, changeMonth };
}
