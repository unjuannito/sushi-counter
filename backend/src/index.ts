import express from "express";
import cors from "cors";
import { authRouter } from "./auth";
import { tournamentsRouter } from "./routes/tournaments";
import http from "http";
import { initWebSocket, notifyClients } from "./websocket/websocketServer"; // Importa notifyClients directamente

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// Crea el servidor HTTP a partir de Express
const server = http.createServer(app);

// Inicia WebSocket con el servidor HTTP
initWebSocket(server); // Sólo inicializas WebSocket

// 🔥 habilita CORS para todas las peticiones
app.use(cors({
  origin: "*", // o "*" si quieres permitir cualquier origen
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'API funcionando correctamente' });
});

app.use(express.json());
app.use("/auth", authRouter);
app.use("/tournaments", tournamentsRouter);

// Ruta para enviar una notificación de "actualización de datos"
app.get('/actualizar-datos', (req, res) => {
  // Aquí llamamos a la función que notifica a los clientes
  notifyClients('¡Actualiza los datos, por favor!');
  res.send('Notificación enviada a los clientes');
});

// Inicia el servidor HTTP
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend en http://localhost:${PORT}`);
});
