import { io, Socket } from 'socket.io-client';

interface WebSocketEvent {
    type: string;
    data: any;
}

class WebSocketService {
    private socket: Socket | null = null;
    private static instance: WebSocketService;
    private isConnected: boolean = false;
    private eventCallbacks: Record<string, Function[]> = {};

    // Método para obtener la instancia singleton del servicio
    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    // Conectar al servidor WebSocket
    public connect() {
        if (this.socket && this.socket.connected) {
            console.log("Ya estás conectado al WebSocket.");
            return;
        }

        const SOCKET_URL = import.meta.env.DEV ? 'localhost:4000' : 'sushi-counter.ydns.eu';
        const SOCKET_PATH = import.meta.env.DEV ? '/socket.io' : '/socket.io';
        let wsToken = sessionStorage.getItem('wsToken');

        // Si no hay token en sessionStorage, nos conectamos sin él y luego el servidor nos enviará uno.
        const queryParams: any = {};
        if (wsToken) {
            queryParams.wsToken = wsToken;
        }

        // Configuración de conexión con Socket.IO
        this.socket = io(SOCKET_URL, {
            path: SOCKET_PATH, // 👈 debe coincidir con el del servidor
            query: queryParams,  // Aquí estamos pasando el wsToken al servidor (si existe)
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        // Cuando nos conectamos, el servidor nos envía un nuevo wsToken
        this.socket.on('connected', (data: { wsToken: string }) => {
            // console.log('Conexión exitosa, wsToken:', data.wsToken);
            sessionStorage.setItem('wsToken', data.wsToken);  // Guardamos el wsToken en sessionStorage
        });

        this.socket.on('connect', () => {
            // console.log('Conectado a WebSocket');
            this.isConnected = true;
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('Error de conexión WebSocket: ', error);
        });

        this.socket.on('disconnect', (reason: string) => {
            console.log('Desconectado del WebSocket. Razón: ', reason);
            this.isConnected = false;
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
            console.log(`Reconectado al WebSocket. Intento #${attemptNumber}`);
        });

        this.socket.on('reconnect_error', (error: Error) => {
            console.error('Error al intentar reconectar: ', error);
        });

        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
            console.log(`Intentando reconectar al WebSocket. Intento #${attemptNumber}`);
        });
    }

    // Desconectar el WebSocket
    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            console.log('WebSocket desconectado');
            this.isConnected = false;
        }
    }

    // Enviar un mensaje a través del WebSocket
    public sendMessage(event: string, message: WebSocketEvent) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, message);
        } else {
            console.warn("No hay conexión activa.");
        }
    }

    // Escuchar un evento desde el servidor WebSocket
    public listenToEvent(event: string, callback: (data: any) => void) {
        if (!this.eventCallbacks[event]) {
            this.eventCallbacks[event] = [];
        }
        this.eventCallbacks[event].push(callback);

        if (this.socket) {
            this.socket.on(event, (data) => {
                this.eventCallbacks[event].forEach(cb => cb(data));
            });
        }
    }

    // Verificar si está conectado al WebSocket
    public getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

export default WebSocketService;
