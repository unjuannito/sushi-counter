const path = require("path");
const dotenv = require("dotenv");

// Carga el .env de la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, ".env") });

module.exports = {
    apps: [
        {
            name: "sushi-counter",
            script: "dist/server.js",       // tu server compilado
            watch: false,                   // no reiniciar por cambios
            instances: 1,                   // o 'max' para cluster
            autorestart: true,
            max_memory_restart: "512M",
            env: {
                NODE_ENV: "production",
                DB_HOST: process.env.DB_HOST || "localhost",
                DB_PORT: process.env.DB_PORT || 3306,
                DB_USER: process.env.DB_USER || "root",
                DB_PASSWORD: process.env.DB_PASSWORD || "",
                DB_NAME: process.env.DB_NAME || "sushi_counter"
            }
        }
    ]
};
