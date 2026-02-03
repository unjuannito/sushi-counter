import { ApiService } from './apiService';
import type { Response } from '~/types/responseType';
import type { Logs } from '~/types/calendarType';
export class CalendarService extends ApiService {
    public async getLogs(): Promise<{ success: boolean; logs?: Logs; errorMessage?: string }> {
        try {
            const response: Response = await this.get(`/calendar/logs`);
            if (response.success) {
                return { success: true, logs: response.logs as Logs };
            } else {
                return { success: false, errorMessage: response.errorMessage };
            }
        } catch (error) {
            console.error("Error fetching calendar logs:", error);
            return { success: false, errorMessage: "Error fetching calendar logs" };
        }
    }

    public async getLogsByDay(date: string): Promise<{ success: boolean; logs?: Logs; errorMessage?: string }> {
        try {
            const response: Response = await this.get(`/calendar/logs/day/${date}`);
            if (response.success) {
                return { success: true, logs: response.logs as Logs };
            } else {
                return { success: false, errorMessage: response.errorMessage };
            }
        } catch (error) {
            console.error("Error fetching day logs:", error);
            return { success: false, errorMessage: "Error fetching day logs" };
        }
    }

    public async getLogsByMonth(year: number, month: number): Promise<{ success: boolean; logs?: Logs; errorMessage?: string }> {
        try {
            const response: Response = await this.get(`/calendar/logs/month/${year}/${month}`);
            if (response.success) {
                return { success: true, logs: response.logs as Logs };
            } else {
                return { success: false, errorMessage: response.errorMessage };
            }
        } catch (error) {
            console.error("Error fetching month logs:", error);
            return { success: false, errorMessage: "Error fetching month logs" };
        }
    }

    public async deleteLog(id: string): Promise<{ success: boolean; errorMessage?: string }> {
        try {
            const response: Response = await this.delete(`/calendar/logs/${id}`);
            return { success: response.success, errorMessage: response.errorMessage };
        } catch (error) {
            console.error("Error deleting log:", error);
            return { success: false, errorMessage: "Error deleting log" };
        }
    }

    //funcion q es tanto para crear un log nuevo como para actualizar uno existente
    public async upsertLog(sushiCount: number, createdAt: string, updatedAt: string): Promise<{ success: boolean; logs?: Logs; errorMessage?: string }> {
        try {
            const response: Response = await this.post(`/calendar/logs/upsert/`, { sushiCount, createdAt, updatedAt });
            if (response.success) {
                return { success: true, logs: response.logs as Logs };
            } else {
                return { success: false, errorMessage: response.errorMessage };
            }
        } catch (error) {
            console.error("Error upserting calendar log:", error);
            return { success: false, errorMessage: "Error upserting calendar log" };
        }
    }
}