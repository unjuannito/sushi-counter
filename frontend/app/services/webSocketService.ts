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

    // Method to get the singleton instance of the service
    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    // Connect to the WebSocket server
    public connect() {
        if (this.socket && this.socket.connected) {
            console.log("Already connected to WebSocket.");
            return;
        }

        const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:50541' : window.location.origin;
        const SOCKET_PATH = '/socket.io';
        let wsToken = sessionStorage.getItem('wsToken');

        // If no token in sessionStorage, we connect without it and then the server will send us one.
        const queryParams: any = {};
        if (wsToken) {
            queryParams.wsToken = wsToken;
        }

        // Socket.IO connection configuration
        console.log(`[WS] Attempting to connect to ${SOCKET_URL} with path ${SOCKET_PATH}`);
        this.socket = io(SOCKET_URL, {
            path: SOCKET_PATH, // 👈 must match the server's path
            query: queryParams,  // Passing wsToken to the server if it exists
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            transports: ['websocket', 'polling'], // Force websocket attempt first
        });

        // When connected, the server sends a new wsToken
        this.socket.on('connected', (data: { wsToken: string }) => {
            console.log('[WS] "connected" event received. New wsToken:', data.wsToken);
            sessionStorage.setItem('wsToken', data.wsToken);  // Save wsToken in sessionStorage
        });

        this.socket.on('connect', () => {
            console.log('[WS] Connection established successfully. ID:', this.socket?.id);
            this.isConnected = true;
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('[WS] Connection error:', error.message, error);
        });

        this.socket.on('disconnect', (reason: string) => {
            console.log('[WS] Disconnected. Reason:', reason);
            this.isConnected = false;
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
            console.log(`Reconnected to WebSocket. Attempt #${attemptNumber}`);
        });

        this.socket.on('reconnect_error', (error: Error) => {
            console.error('Error while attempting to reconnect: ', error);
        });

        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
            console.log(`Attempting to reconnect to WebSocket. Attempt #${attemptNumber}`);
        });
    }

    // Disconnect the WebSocket
    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            console.log('WebSocket disconnected');
            this.isConnected = false;
        }
    }

    // Send a message through the WebSocket
    public sendMessage(event: string, message: WebSocketEvent) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, message);
        } else {
            console.warn("No active connection.");
        }
    }

    // Listen to an event from the WebSocket server
    public listenToEvent(event: string, callback: (data: any) => void) {
        if (!this.eventCallbacks[event]) {
            this.eventCallbacks[event] = [];
            
            // Register the socket listener ONLY once per event
            if (this.socket) {
                this.socket.on(event, (data) => {
                    this.eventCallbacks[event].forEach(cb => cb(data));
                });
            }
        }
        
        // Add callback to the list if not already present
        if (!this.eventCallbacks[event].includes(callback)) {
            this.eventCallbacks[event].push(callback);
        }
    }

    // Method to stop listening to an event
    public stopListening(event: string, callback: (data: any) => void) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event] = this.eventCallbacks[event].filter(cb => cb !== callback);
        }
    }

    // Check if connected to the WebSocket
    public getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

export default WebSocketService;
