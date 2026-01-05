import { Request, Response } from "express";
import { pool } from "../db/db";
import generateId from "../utils/generateId";
import { getUserByCode } from "../services/userSevices";
import { User } from "../types/userType";

export const createAccount = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || name == '') {
    return res.json({
      success: false,
      errorMessage: "Name is compulsary",
    });
  }

  try {
    let code: string;
    let existsCode = true;

    do {
      code = generateId();
      const [rows] = await pool.query(
        "SELECT code FROM users WHERE code = ? LIMIT 1",
        [code]
      );
      existsCode = (rows as any[]).length > 0;
    } while (existsCode);

    let id: string;
    let existsId = true;

    do {
      id = generateId();
      const [rows] = await pool.query(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [id]
      );
      existsId = (rows as any[]).length > 0;
    } while (existsId);


    const [result] = await pool.query(
      "INSERT INTO users (id, code, name) VALUES (?, ?, ?)",
      [id, code, name]
    );

    const insertedUser = {
      id,
      code,
      name,
    };

    return res.json({
      success: true,
      user: insertedUser,
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  const { userCode } = req.params;
  const reqUser = await getUserByCode(userCode);
  if (!reqUser.success || !reqUser.user) {
    return res.json({
      success: false,
      errorMessage: `Error during verifying user. ${reqUser.errorMessage} `,
    });
  }
  const user: User = reqUser.user;
  return res.json({
    success: true,
    user
  });
};
