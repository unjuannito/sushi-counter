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

    const googleLogin = async (credential: string) => {
        const response = await authService.googleLogin(credential);
        if (response.success && response.user) {
            setUser(response.user);
            if (response.token) ApiService.setToken(response.token);
            if (response.refreshToken) ApiService.setRefreshToken(response.refreshToken);

            return { success: true };
        }
        return { success: false, errorMessage: response.errorMessage };
    };

    const logout = () => {
        setUser(null);
        ApiService.setToken(null);
        ApiService.setRefreshToken(null);
        // redirect to /
        window.location.href = '/';
    };

    const forgotPassword = async (email: string) => {
        return await authService.forgotPassword(email);
    };

    const resetPassword = async (token: string, newPassword: string) => {
        return await authService.resetPassword(token, newPassword);
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

    const requestDeletion = async () => {
        const response = await authService.requestDeletion();
        if (response.success) {
            await refreshUser();
            return { success: true };
        }
        return { success: false, errorMessage: response.errorMessage };
    };

    const cancelDeletion = async () => {
        const response = await authService.cancelDeletion();
        if (response.success) {
            await refreshUser();
            return { success: true };
        }
        return { success: false, errorMessage: response.errorMessage };
    };

    return (
        <AuthContext.Provider
            value={{
                register,
                login,
                googleLogin,
                logout,
                forgotPassword,
                resetPassword,
                refreshUser,
                linkGoogle,
                unlinkGoogle,
                updateProfile,
                requestDeletion,
                cancelDeletion,
                user,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
