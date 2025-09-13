import { Router } from "express";
import { pool } from "./db";

export const authRouter = Router();

// Función para generar un código aleatorio de 6 chars
function generateUserCode(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST /api/auth/create
 * Crea un usuario con name y un código único
 */
authRouter.post("/create", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.json({
      success: false,
      errorMessage: "El campo 'name' es obligatorio",
    });
  }

  try {
    let code: string;
    let exists = true;

    // Generar hasta encontrar un código no existente
    do {
      code = generateUserCode();
      const [rows] = await pool.query(
        "SELECT user_code FROM users WHERE user_code = ? LIMIT 1",
        [code]
      );
      exists = (rows as any[]).length > 0;
    } while (exists);

    // Insertar usuario
    const [result] = await pool.query(
      "INSERT INTO users (name, user_code) VALUES (?, ?)",
      [name, code]
    );

    const insertedUser = {
      name,
      userCode: code,
    };
    return res.json({
      success: true,
      user: insertedUser,
    });
  } catch (err: any) {
    console.error('paco', err);
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
});

/**
 * POST /api/auth/verify
 * Verifica si existe un usuario por código
 */
authRouter.get("/verify", async (req, res) => {
  const { userCode } = req.query;

  if (!userCode) {
    return res.json({
      success: false,
      errorMessage: "El campo 'userCode' es obligatorio",
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT user_code, name, user_code FROM users WHERE user_code = ? LIMIT 1",
      [userCode]
    );

    if ((rows as any[]).length === 0) {
      return res.json({
        success: false,
        errorMessage: "El usuario no existe",
      });
    }

    return res.json({
      success: true,
      user: {
        name: (rows as any[])[0].name,
        userCode: (rows as any[])[0].user_code,
      },
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
});
