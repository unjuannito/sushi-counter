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
    console.log(`[WS Server] Nueva conexión física: ${socket.id}`);
    console.log(`[WS Server] Transport: ${socket.conn.transport.name}`);

    // Verificar si el cliente trae un wsToken desde la conexión
    let wsToken = socket.handshake.query.wsToken as string;

    if (!wsToken) {
      wsToken = randomUUID();
      console.log(`[WS Server] No se recibió wsToken. Generado nuevo: ${wsToken}`);
    } else {
      console.log(`[WS Server] Cliente se reconectó con wsToken existente: ${wsToken}`);
    }

    clients.set(wsToken, socket);
    
    // Unir al socket a una "sala" global o por wsToken si quisiéramos targetear
    socket.join("global");

    // Envía el wsToken al cliente
    socket.emit("connected", { wsToken });

    socket.on("disconnect", (reason) => {
      console.log(`[WS Server] Cliente desconectado (${wsToken}). Razón: ${reason}`);
      // Solo lo borramos si el socket en el mapa es el mismo que se está desconectando
      if (clients.get(wsToken)?.id === socket.id) {
        clients.delete(wsToken);
      }
    });

    // Escucha mensajes personalizados
    socket.on("send_message", (message: string) => {
      console.log(`[WS Server] Mensaje recibido: ${message}`);
      socket.emit("message_received", { message: `Tu mensaje fue recibido: ${message}` });
    });
  });
}

// Función para enviar una notificación a todos los clientes conectados
export function notifyClients(event: string, data?: any) {
  if (!io) {
    console.error("[WS Server] Error: Intentando notificar antes de inicializar io");
    return;
  }

  console.log(`[WS Server] Notificando a todos los clientes. Evento: "${event}".`);
  
  // Usar io.emit para enviar a TODOS los sockets conectados de forma eficiente
  io.emit(event, data || {});
  
  console.log(`[WS Server] Notificación "${event}" enviada vía io.emit`);
}
