import { Server } from "socket.io";
import { randomUUID } from "crypto";
import * as http from "http";

// Esta variable mantendrá las conexiones activas
const clients: Map<string, import("socket.io").Socket> = new Map();

// Inicialización del servidor WebSocket
export function initWebSocket(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado", socket.id);

    // Verificar si el cliente trae un wsToken desde la conexión
    let wsToken = socket.handshake.query.wsToken as string;

    if (!wsToken) {
      // Si no hay wsToken, se genera uno nuevo
      wsToken = randomUUID();
    }

    clients.set(wsToken, socket);

    console.log(`Nuevo cliente conectado con wsToken: ${wsToken}`);

    // Envía el wsToken al cliente
    socket.emit("connected", { wsToken });

    socket.on("disconnect", () => {
      // Elimina la conexión cuando el cliente se desconecta
      clients.delete(wsToken);
      console.log(`Cliente desconectado con wsToken: ${wsToken}`);
    });

    // Escucha mensajes personalizados
    socket.on("send_message", (message: string) => {
      console.log(`Mensaje recibido: ${message}`);
      socket.emit("message_received", { message: `Tu mensaje fue recibido: ${message}` });
    });
  });
}

// Función para enviar una notificación a todos los clientes conectados
export function notifyClients(message: string) {
  console.log("Notificando a todos los clientes: ", message);
  clients.forEach((clientSocket, wsToken) => {
    clientSocket.emit("update", message);
    console.log(`Notificación enviada al cliente ${wsToken}`);
  });
}
