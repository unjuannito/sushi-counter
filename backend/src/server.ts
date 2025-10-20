// src/server.ts
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import http from "http";
import cors from "cors";

import { initWebSocket } from "./websocket/websocketServer";
import { router as apiRouter } from "./routes"; // ← Importa el nuevo archivo de rutas

const app = express();
const PORT = 4000;

// Añade CORS solo para desarrollo o para la API
app.use(
  "/api",
  cors({
    origin: "http://localhost:5173", // Aquí la URL de tu frontend React en dev
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // si usas cookies o autenticación
  })
);


// Crear servidor HTTP
const server = http.createServer(app);

// Middleware para leer JSON
// app.use(express.json());
// Ruta ejemplo API
app.use("/api", express.json()); // middleware solo para API
app.use("/api", apiRouter); // Las rutas API se manejan aquí.

// Ruta a la build de React
const clientPath = path.join(__dirname, "../client");

// Comprueba que la carpeta exista
if (!fs.existsSync(clientPath)) {
  console.error(`[error] client build folder NO encontrada en: ${clientPath}`);
} else {
  console.log(`[info] Sirviendo archivos estáticos desde: ${clientPath}`);
  // Servir archivos estáticos (HTML, JS, CSS, imágenes...)
  // maxAge ajustable si quieres cache
  app.use(express.static(clientPath, { index: false }));
}

// Middleware para depurar archivos estáticos no encontrados (opcional, útil localmente)
app.use((req: Request, res: Response, next: NextFunction) => {
  // Solo para propósitos de debug local; puedes quitar o comentar en producción
  const maybeFile = path.join(clientPath, req.path);
  if (path.extname(req.path)) {
    // Petición con extensión (ej. .js, .css, .png)
    if (!fs.existsSync(maybeFile)) {
      console.warn(`[warn] static file not found -> ${req.path} (esperado en ${maybeFile})`);
    } else {
      // existe el archivo pero express.static lo habría servido; esto es raro
      console.log(`[info] static file exists -> ${req.path}`);
    }
  }
  next();
});

// --- Catch-all robusto para SPA (solo para peticiones que acepten HTML y no tengan extensión)
app.use((req: Request, res: Response, next: NextFunction) => {
  // No interferir con rutas API
  if (req.path.startsWith("/api")) return next();
  if (req.path.startsWith("/socket.io")) return next();

  // Si la petición tiene extensión (ej. .js, .css, .png), dejar que caiga al 404
  if (path.extname(req.path)) return next();

  // Si el cliente no acepta HTML, no servir index.html
  if (!req.accepts || !req.accepts("html")) return next();

  const indexHtml = path.join(clientPath, "index.html");
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).send("React build no encontrado. Ejecuta el build y coloca la carpeta en /client");
  }
});

// Fallback 404 para recursos estáticos no encontrados
app.use((req: Request, res: Response) => {
  res.status(404).send("Not found1");
});

// app.listen(PORT, () => {
//   console.log(`✅ Servidor escuchando en http://localhost:${PORT}/`);
// });
initWebSocket(server);

// Escuchar en puerto 4000
server.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}/`);
});
