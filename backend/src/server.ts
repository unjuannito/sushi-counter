import http from "http";
import { config } from "./config/config";
import { createApp } from "./app";
import { initWebSocket } from "./websocket/websocketServer";
import { runMigrations } from "./db/migrations";
import { initScheduler } from "./services/scheduler";

async function boot() {
  try {
    // Run database migrations
    runMigrations();

    const app = await createApp();
    const server = http.createServer(app);

    // init WebSocket
    initWebSocket(server);

    // Initialize background tasks
    initScheduler();

    // Escuchar en puerto configurado
    server.listen(config.port, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${config.port}/`);
    });
  } catch (error) {
    console.error("❌ Critical server boot error:", error);
    process.exit(1);
  }
}

boot();
