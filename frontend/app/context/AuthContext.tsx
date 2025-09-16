import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { AuthService } from '../services/authService';

import type { User } from '~/types/userType';
import type { AuthContextType } from '~/types/authContextType';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
const authService = new AuthService();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const verifyUser = async (userCode: string): Promise<{ success: boolean, errorMessage?: string }> => {
        try {
            const response = await authService.verifyUser(userCode);
            if (response.success) {
                setUser(response.user ? response.user : null);
                localStorage.setItem('userCode', response.user?.code);
                return { success: true };
            } else {
                setUser(null);
                return { success: false, errorMessage: response.errorMessage };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    };

    const createUser = async (name: string): Promise<{ success: boolean, user?: User, errorMessage?: string }> => {
        try {
            const response = await authService.createUser(name);
            if (response.success && response.user) {
                setUser(response.user ? response.user : null);
                localStorage.setItem('userCode', response.user.code);
                return { success: true, user: response.user as User };
            } else {
                setUser(null);
                return { success: false, errorMessage: response.errorMessage };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    };

    return (
        <AuthContext.Provider
            value={{ verifyUser, createUser, user }}
        >
            {children}
        </AuthContext.Provider>
    );
};