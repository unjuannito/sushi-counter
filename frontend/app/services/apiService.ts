import axios from "axios";
import { io, Socket } from "socket.io-client";  // Importamos socket.io-client
import type { AxiosInstance, AxiosResponse } from "axios";

export class ApiService {
    protected baseUrl: string;
    protected axiosInstance: AxiosInstance;
    private static token: string | null = null;
    public socket: Socket | null = null;

    constructor() {
        this.baseUrl = import.meta.env.DEV ? 'http://192.168.1.200:4000/api' : '/api';
        // alert("API URL: " + this.baseUrl);

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (event) => {
                if (event.key === 'auth_token') {
                    ApiService.token = event.newValue;
                }
            });
        }

        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    ApiService.setToken(null);
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

    // WebSocket: Establecer conexión
    public connectWebSocket() {
        const SOCKET_URL = import.meta.env.DEV ? 'http://192.168.1.200:4000' : '/';

        this.socket = io(SOCKET_URL);

        // Aquí puedes escuchar cualquier evento que el backend emita
        this.socket.on('update', (message: string) => {
            console.log('Mensaje de WebSocket recibido: ', message);
            // Aquí podrías manejar la actualización en la UI o en el estado global
            // alert(message);  // Por ejemplo, mostrar un alerta con el mensaje
        });
    }

    // WebSocket: Desconectar
    public disconnectWebSocket() {
        if (this.socket) {
            this.socket.disconnect();
            console.log('WebSocket desconectado');
        }
    }

    protected static setToken(token: string | null) {
        ApiService.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    protected static getToken(): string | null {
        if (!ApiService.token) {
            ApiService.token = localStorage.getItem('auth_token');
        }
        return ApiService.token;
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
