import { createContext, useState, useEffect, type ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { ApiService } from '../services/apiService';

import type { User } from '~/types/userType';
import type { AuthContextType } from '~/types/authContextType';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
const authService = new AuthService();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('authToken');

            if (storedToken) {
                try {
                    const response = await authService.getMe();
                    if (response.success && response.user) {
                        setUser(response.user as User);
                    } else {
                        // Token invalid or expired
                        logout();
                    }
                } catch (error) {
                    console.error("Error initializing auth:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const verifyUser = async (userCode: string): Promise<{ success: boolean, user?: User, errorMessage?: string }> => {
        try {
            const response = await authService.verifyUser(userCode);
            if (response.success) {
                const verifiedUser = response.user ? response.user as User : null;
                // No seteamos el user aquí para no entrar en bucle de login
                // El componente LoginDialog se encargará de mostrar la pantalla de migración
                return { success: true, user: verifiedUser || undefined };
            } else {
                localStorage.removeItem('userCode');
                return { success: false, errorMessage: response.errorMessage };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, errorMessage };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await authService.register(name, email, password);
        if (response.success && response.user) {
            setUser(response.user);
            if (response.token) ApiService.setToken(response.token);
            if (response.refreshToken) ApiService.setRefreshToken(response.refreshToken);
            return { success: true };
        }
        return { success: false, errorMessage: response.errorMessage };
    };

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password);
        if (response.success && response.user) {
            setUser(response.user);
            if (response.token) {
                ApiService.setToken(response.token);
                if (response.refreshToken) ApiService.setRefreshToken(response.refreshToken);
            }
            return { success: true };
        }
        return { success: false, errorMessage: response.errorMessage };
    };

    const googleLogin = async (credential: string, userId?: string) => {
        const response = await authService.googleLogin(credential, userId);
        if (response.success && response.user) {
            setUser(response.user);
            if (response.token) ApiService.setToken(response.token);
            if (response.refreshToken) ApiService.setRefreshToken(response.refreshToken);

            // If this was a migration (userId was provided), remove the legacy userCode
            if (userId) {
                localStorage.removeItem('userCode');
            }

            return { success: true };
        }
        return { success: false, errorMessage: response.errorMessage };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userCode');
        ApiService.setToken(null);
        ApiService.setRefreshToken(null);
        // redirect to /
        window.location.href = '/';
        // add guest to sessionStorage
        sessionStorage.setItem('isGuest', 'true');
    };

    const forgotPassword = async (email: string) => {
        return await authService.forgotPassword(email);
    };

    const resetPassword = async (token: string, newPassword: string) => {
        return await authService.resetPassword(token, newPassword);
    };

    const migrateAccount = async (data: { userId: string, email: string, password?: string, name?: string }) => {
        const response = await authService.migrateAccount(data);
        if (response.success && response.user && response.token) {
            setUser(response.user as User);
            ApiService.setToken(response.token);
            if (response.refreshToken) ApiService.setRefreshToken(response.refreshToken);
            localStorage.removeItem('userCode');
        }
        return response;
    };

    const refreshUser = async () => {
        try {
            const response = await authService.getMe();
            if (response.success && response.user) {
                setUser(response.user as User);
            }
        } catch (error) {
            console.error("Error refreshing user:", error);
        }
    };

    const linkGoogle = async (credential: string) => {
        const response = await authService.linkGoogle(credential);
        if (response.success) {
            await refreshUser();
            return { success: true };
        }
        return { success: false, errorMessage: response.errorMessage };
    };

    const unlinkGoogle = async () => {
        const response = await authService.unlinkGoogle();
        if (response.success) {
            await refreshUser();
            return { success: true };
        }
        return { success: false, errorMessage: response.errorMessage };
    };

    const updateProfile = async (data: { name?: string; email?: string; password?: string; currentPassword?: string }) => {
        const response = await authService.updateProfile(data);
        if (response.success) {
            await refreshUser();
            return { success: true };
        }
        return { success: false, errorMessage: response.errorMessage };
    };

    return (
        <AuthContext.Provider
            value={{
                verifyUser,
                register,
                login,
                googleLogin,
                logout,
                forgotPassword,
                resetPassword,
                migrateAccount,
                refreshUser,
                linkGoogle,
                unlinkGoogle,
                updateProfile,
                user,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};