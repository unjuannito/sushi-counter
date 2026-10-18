import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import * as http from "http";

// Esta variable mantendrá la instancia de io
let io: Server | null = null;

// Esta variable mantendrá las conexiones activas por wsToken (opcional, para tracking)
const clients: Map<string, Socket> = new Map();

// Inicialización del servidor WebSocket
export function initWebSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {

    // Verificar si el cliente trae un wsToken desde la conexión
    let wsToken = socket.handshake.query.wsToken as string;

    if (!wsToken) {
      wsToken = randomUUID();
    } else {
    }

    clients.set(wsToken, socket);
    
    // Unir al socket a una "sala" global o por wsToken si quisiéramos targetear
    socket.join("global");

    // Envía el wsToken al cliente
    socket.emit("connected", { wsToken });

    socket.on("disconnect", (reason) => {
      // Solo lo borramos si el socket en el mapa es el mismo que se está desconectando
      if (clients.get(wsToken)?.id === socket.id) {
        clients.delete(wsToken);
      }
    });

    // Escucha mensajes personalizados
    socket.on("send_message", (message: string) => {
      socket.emit("message_received", { message: `Tu mensaje fue recibido: ${message}` });
    });
  });
}

// Función para enviar una notificación a todos los clientes conectados
export function notifyClients(event: string, data?: any) {
  if (!io) {
    return;
  }

  
  // Usar io.emit para enviar a TODOS los sockets conectados de forma eficiente
  io.emit(event, data || {});
  
}
