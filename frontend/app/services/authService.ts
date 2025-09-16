import type { User } from '~/types/userType';
import { ApiService } from './apiService';
import type { Response } from '~/types/responseType';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
}

export class AuthService extends ApiService {
    public async verifyUser(userCode: string): Promise<Response> {
        try {
            const response: Response = await this.get(`/auth/verify/${userCode}`);
            console.log(response)
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async createUser(name: string): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/create`, { name });
            if (response.success) {
                return { success: true, user: response.user as User };
            } else {
                return { success: false, errorMessage: response.errorMessage };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }
}
