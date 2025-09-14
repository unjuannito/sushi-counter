import { Server } from "socket.io";
import http from "http";

// Crear la instancia de Socket.IO a nivel global
let io: Server;

// Esta función inicializa el servidor WebSocket
export const initWebSocket = (httpServer: http.Server) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // La URL de tu frontend
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true, // Si necesitas cookies o encabezados de autenticación
    },
  });

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Escuchar la desconexión de los clientes
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
};

// Función para enviar un mensaje a todos los clientes conectados
export const notifyClients = (message: string) => {
  if (io) {
    io.emit('update', message); // 'update' es el evento que los clientes escuchan
  }
};
