import { Router } from "express";
import { authRouter } from "./routes/auth";
import { tournamentsRouter } from "./routes/tournaments";
import { calendarRouter } from "./routes/calendar";
import generateId from "./utils/generateId";
import { notifyClients } from "./websocket/websocketServer";

const router = Router();

// Middleware para parsear JSON solo para /api
router.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Ruta test de salud
router.get("/", (req, res) => {
  res.json({ ok: true, message: "API funcionando correctamente: " + generateId() });
});

// Rutas funcionales
router.use("/auth", authRouter);
router.use("/tournaments", tournamentsRouter);
router.use("/calendar", calendarRouter);

// Ruta adicional: notificar a clientes
router.get("/actualizar-datos", (req, res) => {
  notifyClients("¡Actualiza los datos, por favor!");
  res.json({ message: "Notificación enviada a los clientes" });
});

export { router };
