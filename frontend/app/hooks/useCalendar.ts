import { useCallback, useEffect, useState } from "react";
import { CalendarService } from "~/services/calendarService";
import type { Logs } from "~/types/calendarType";
import { useAuth } from "./useAuth";

export function useCalendar(initialMonth?: { month: number, year: number }) {
    const { user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(initialMonth || { month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const [logs, setLogs] = useState<Logs>([]);
    const [error, setError] = useState<string | null>(null);
    const service = new CalendarService();


    const fetchLogsByMonth = useCallback(async (year: number, month: number) => {
        if (!user) return;
        const response = await service.getLogsByMonth(year, month);
        if (response.success) {
            setLogs(response.logs || []);
        } else {
            setError(response.errorMessage || 'Error fetching month logs');
        }
    }, [user]);

    const fetchLogsByDay = useCallback(async (date: string) => {
        if (!user) return;
        const response = await service.getLogsByDay(date);
        if (response.success) {
            setLogs(response.logs || []);
        } else {
            setError(response.errorMessage || 'Error fetching day logs');
        }
    }, [user]);

    const upsertLog = useCallback(async (sushiCount: number, createdAt: Date, updatedAt: Date) => {
        if (!user) return;
        
        const toLocalSqlString = (date: Date) => {
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        const response = await service.upsertLog(sushiCount, toLocalSqlString(createdAt), toLocalSqlString(updatedAt));
        if (!response.success) {
            setError(response.errorMessage || 'Error upserting log');
            return;
        }
        if (response.logs) {
            setLogs(response.logs);
        }
    }, [user]);

    const deleteLog = useCallback(async (id: string) => {
        if (!user) return;
        const response = await service.deleteLog(id);
        if (response.success) {
            setLogs(prev => prev.filter(log => log.id !== id));
        } else {
            setError(response.errorMessage || 'Error deleting log');
        }
    }, [user]);

    const changeMonth = useCallback((month: string) => {
        const [yearPart, monthPart] = month.split("-");
        const year = Number(yearPart);
        const monthNum = Number(monthPart);
        setCurrentMonth({ month: monthNum, year });
        fetchLogsByMonth(year, monthNum);
    }, [fetchLogsByMonth]);

    return { logs, currentMonth, upsertLog, deleteLog, fetchLogsByDay, fetchLogsByMonth, error, changeMonth };
}
