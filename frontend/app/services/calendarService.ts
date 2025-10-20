import { ApiService } from './apiService';
import type { Response } from '~/types/responseType';
import type { Logs } from '~/types/calendarType';
export class CalendarService extends ApiService {
    public async getLogs(userCode: string): Promise<{ success: boolean; logs?: Logs; errorMessage?: string }> {
        try {
            const response: Response = await this.get(`/calendar/logs/${userCode}`);
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

    //funcion q es tanto para crear un log nuevo como para actualizar uno existente
    public async upsertLog(userCode: string, sushiCount: number, createdAt: string, updatedAt: string): Promise<{ success: boolean; logs?: Logs; errorMessage?: string }> {
        try {
            const response: Response = await this.post(`/calendar/logs/upsert/`, { userCode, sushiCount, createdAt, updatedAt });
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