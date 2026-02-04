import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";

export class ApiService {
    protected baseUrl: string;
    protected axiosInstance: AxiosInstance;
    private static token: string | null = null;
    private static refreshToken: string | null = null;
    private static isRefreshing = false;
    private static refreshSubscribers: ((token: string) => void)[] = [];

    constructor() {
        this.baseUrl = import.meta.env.DEV ? 'http://localhost:50541/api' : '/api';

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest' // Simple CSRF protection
            },
        });

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (event) => {
                if (event.key === 'authToken') {
                    ApiService.token = event.newValue;
                }
                if (event.key === 'refreshToken') {
                    ApiService.refreshToken = event.newValue;
                }
            });
        }

        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (ApiService.isRefreshing) {
                        return new Promise(resolve => {
                            ApiService.refreshSubscribers.push((token: string) => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                resolve(this.axiosInstance(originalRequest));
                            });
                        });
                    }

                    originalRequest._retry = true;
                    ApiService.isRefreshing = true;

                    const refreshToken = ApiService.getRefreshToken();
                    if (refreshToken) {
                        try {
                            // Use axiosInstance to ensure same config/basePath
                            const response = await axios.post(`${this.baseUrl}/auth/refresh-token`, { refreshToken });
                            if (response.data.success) {
                                const { token: newToken, refreshToken: newRefreshToken } = response.data;
                                ApiService.setToken(newToken);
                                ApiService.setRefreshToken(newRefreshToken);

                                ApiService.isRefreshing = false;
                                ApiService.onTokenRefreshed(newToken);

                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                return this.axiosInstance(originalRequest);
                            }
                        } catch (refreshError) {
                            console.error("Token refresh failed:", refreshError);
                        }
                    }

                    ApiService.isRefreshing = false;
                    ApiService.setToken(null);
                    ApiService.setRefreshToken(null);
                    
                    // Nota: No redirigimos a /login porque el login es un Dialog que salta en la raíz (/)
                    // Si el refresh falla, simplemente limpiamos tokens. El AuthContext detectará que no hay user
                    // y debería disparar la apertura del Dialog de login.
                    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                        window.location.href = '/';
                    }
                }
                return Promise.reject(error);
            }
        );

        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = ApiService.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    private static onTokenRefreshed(token: string) {
        ApiService.refreshSubscribers.map(cb => cb(token));
        ApiService.refreshSubscribers = [];
    }

    public static setToken(token: string | null) {
        ApiService.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    public static setRefreshToken(token: string | null) {
        ApiService.refreshToken = token;
        if (token) {
            localStorage.setItem('refreshToken', token);
        } else {
            localStorage.removeItem('refreshToken');
        }
    }

    protected static getToken(): string | null {
        if (!ApiService.token) {
            ApiService.token = localStorage.getItem('authToken');
        }
        return ApiService.token;
    }

    protected static getRefreshToken(): string | null {
        if (!ApiService.refreshToken) {
            ApiService.refreshToken = localStorage.getItem('refreshToken');
        }
        return ApiService.refreshToken;
    }

    protected async get<T>(endpoint: string): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.get(endpoint);
        return response.data;
    }

    protected async post<T, D>(endpoint: string, data: D): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.post(endpoint, data);
        return response.data;
    }

    protected async put<T, D>(endpoint: string, data: D): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.put(endpoint, data);
        return response.data;
    }

    protected async delete<T>(endpoint: string): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.delete(endpoint);
        return response.data;
    }
}