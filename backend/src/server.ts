import express from "express";
import cors from "cors";
import http from "http";
import path from "path";

import { initWebSocket } from "./websocket/websocketServer";
import { router as apiRouter } from "./routes"; // ← Importa el nuevo archivo de rutas

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// Crear servidor HTTP
const server = http.createServer(app);

// Iniciar WebSocket
initWebSocket(server);

// Habilitar CORS para todas las rutas
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

// Parsear JSON solo en /api rutas
app.use("/api", express.json()); // middleware solo para API

// Usar rutas de API (que siempre responden en JSON)
app.use("/api", apiRouter);

// Servir archivos estáticos desde carpeta "public"
app.use(express.static(path.join(__dirname, "../public"))); // ← Ojo: usa path correcto al compilar

// Iniciar servidor
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📦 API en: http://localhost:${PORT}/api`);
  console.log(`🌐 Web pública en: http://localhost:${PORT}/`);
});
