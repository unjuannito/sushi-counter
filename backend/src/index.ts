import express from "express";
import cors from "cors";
import { authRouter } from "./auth";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

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
app.use("/api/auth", authRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend en http://localhost:${PORT}`);
});
