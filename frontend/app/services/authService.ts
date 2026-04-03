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
    public async register(name: string, email: string, password: string): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/register`, { name, email, password });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async login(email: string, password: string): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/login`, { email, password });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async googleLogin(credential: string): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/google`, { credential });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async forgotPassword(email: string): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/forgot-password`, { email });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async resetPassword(token: string, newPassword: string): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/reset-password`, { token, newPassword });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async getMe(): Promise<Response> {
        try {
            const response: Response = await this.get(`/auth/me`);
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async linkGoogle(credential: string): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/link-google`, { credential });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async unlinkGoogle(): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/unlink-google`, {});
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async updateProfile(data: { name?: string; email?: string; password?: string; currentPassword?: string }): Promise<Response> {
        try {
            const response: Response = await this.put(`/auth/profile`, data);
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async requestDeletion(): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/request-deletion`, {});
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }

    public async cancelDeletion(): Promise<Response> {
        try {
            const response: Response = await this.post(`/auth/cancel-deletion`, {});
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    }
}
