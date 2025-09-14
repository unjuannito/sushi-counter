// services/user.service.ts
import { RowDataPacket } from 'mysql2';
import { pool } from '../db'; // o tu instancia de Prisma, Sequelize, etc.

export const getUserName = async (userCode: string) => {
    const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT name FROM users WHERE user_code = ? LIMIT 1",
        [userCode ]
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
    const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT user_code, name FROM users WHERE user_code IN ?",
        [userCodes]
    );

    if (rows.length > 0) {
        const users = rows.map(user => ({
            userCode: user.user_code,
            name: user.name
        }));

        return {
            success: true,
            users: users
        };
    }

    return { success: false, errorMessage: "User not found" };
};

// puedes exportar más funciones según necesites
