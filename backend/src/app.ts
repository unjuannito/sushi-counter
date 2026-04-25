import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router as apiRouter } from "./routes/index";
import { csrfMiddleware } from "./middleware/csrfMiddleware";
import compression from "compression";
import { createRequestHandler } from "@react-router/express";

export async function createApp() {
  const app = express();

  // Trust the first proxy (e.g. Nginx) to get the correct client IP for rate limiting
  app.set('trust proxy', 1);

  app.use(compression());
  app.use(cookieParser());

  // Desactivar ETag para toda la app (incluye /api)
  app.set('etag', false);

  // CSRF Protection for all API state-changing requests
  app.use("/api", csrfMiddleware);

  // Añade CORS solo para desarrollo o para la API
  app.use(
    "/api",
    cors({
      origin: "http://localhost:5173", // Aquí la URL de tu frontend React en dev
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true, // si usas cookies o autenticación
    })
  );

  // Middleware para desactivar caché en todas las rutas bajo /api
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
  });

  // Middleware para leer JSON
  app.use("/api", express.json()); // middleware solo para API
  app.use("/api", apiRouter); // Las rutas API se manejan aquí.

  // --- Catch-all para React Router SSR ---
  const clientPath = path.resolve(__dirname, "../../frontend/build/client");
  const serverBuildPath = path.resolve(__dirname, "../../frontend/build/server/index.js");

  // Servir archivos estáticos
  if (fs.existsSync(clientPath)) {
    console.log(`[info] Sirviendo archivos estáticos desde: ${clientPath}`);
    app.use(express.static(clientPath, { index: false, etag: true }));
  } else {
    console.warn(`[warn] Carpeta de build de frontend no encontrada en: ${clientPath}`);
  }

  // Manejador de React Router
  app.all("*path", async (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }

    try {
      // Importación dinámica para el build de servidor (ESM)
      const build = await import(serverBuildPath);
      const handler = createRequestHandler({ build });
      return handler(req, res, next);
    } catch (error) {
      console.error("[error] Fallo al cargar el build del servidor de React Router:", error);
      res.status(500).send("Error interno del servidor (React Router Build no encontrado)");
    }
  });

  // Fallback 404 para recursos estáticos no encontrados
  app.use((req: Request, res: Response) => {
    res.status(404).send("Not found");
  });

  return app;
}
