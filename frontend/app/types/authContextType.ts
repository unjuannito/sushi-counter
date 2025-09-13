import type { User } from './userType';

export interface AuthContextType {
    user: User | null;
    verifyUser: (userCode: string) => Promise<{ success: boolean, errorMessage?: string }>;
    createUser: (name: string) => Promise<{ success: boolean, user?: User, errorMessage?: string }>;
}
