import type { User } from './userType';

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    verifyUser: (userCode: string) => Promise<{ success: boolean, user?: User, errorMessage?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean, errorMessage?: string }>;
    login: (email: string, password: string) => Promise<{ success: boolean, errorMessage?: string }>;
    googleLogin: (credential: string, userId?: string) => Promise<{ success: boolean, errorMessage?: string }>;
    logout: () => void;
    forgotPassword: (email: string) => Promise<{ success: boolean, message?: string, errorMessage?: string }>;
    resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean, message?: string, errorMessage?: string }>;
    migrateAccount: (data: { userId: string, email: string, password?: string, name?: string }) => Promise<{ success: boolean, errorMessage?: string }>;
    refreshUser: () => Promise<void>;
    linkGoogle: (credential: string) => Promise<{ success: boolean, errorMessage?: string }>;
    unlinkGoogle: () => Promise<{ success: boolean, errorMessage?: string }>;
    updateProfile: (data: { name?: string; email?: string; password?: string; currentPassword?: string }) => Promise<{ success: boolean, errorMessage?: string }>;
}
