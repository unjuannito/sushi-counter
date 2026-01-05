// services/user.service.ts
import { pool } from "../db/db"; // o tu instancia de Prisma, Sequelize, etc.
import { User } from '../types/userType';
import generateId from '../utils/generateId';

export const getUserName = async (id: string) => {
    const [rows] = await pool.query<any[]>(
        "SELECT name FROM users WHERE id = ? LIMIT 1",
        [id]
    );
    if (rows.length > 0) {
        return {
            success: true,
            name: rows[0].name
        };
    }
    return { success: false, errorMessage: "User not found" };
};

export const getUsers = async (userCodes: string[]) => {
    if (userCodes.length === 0) return { success: true, users: [] };
    
    const placeholders = userCodes.map(() => '?').join(', ');
    const [rows] = await pool.query<any[]>(
        `SELECT code, name FROM users WHERE code IN (${placeholders})`,
        userCodes
    );

    if (rows.length > 0) {
        const users = rows.map(user => ({
            userCode: user.code,
            name: user.name
        }));

        return {
            success: true,
            users: users
        };
    }

    return { success: false, errorMessage: "User not found" };
};

export const getUserByCode = async (userCode: string) => {
    try{
    const [rows] = await pool.query<any[]>(
        "SELECT id, code, name FROM users WHERE code = ? LIMIT 1",
        [userCode]
    );
    if (rows.length > 0) {
        return {
            success: true,
            user: rows[0] as User
        };
    }
    return { success: false, errorMessage: "User not found" };

  } catch (err: any) {
    return {
      success: false,
      errorMessage: err.message,
    };
  }
}