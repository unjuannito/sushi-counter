import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "sushi_counter",
});

app.use(express.json());

app.get("/api/ping", (req, res) => {
    res.json({ msg: "pong" });
});

app.listen(PORT, () => {
    console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
});
