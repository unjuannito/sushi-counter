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

export const getUsersByIds = async (userIds: string[]) => {
    if (userIds.length === 0) return { success: true, users: [] };
    
    const placeholders = userIds.map(() => '?').join(', ');
    const [rows] = await pool.query<any[]>(
        `SELECT id, name FROM users WHERE id IN (${placeholders})`,
        userIds
    );

    if (rows.length > 0) {
        const users = rows.map(user => ({
            id: user.id,
            name: user.name
        }));

        return {
            success: true,
            users: users
        };
    }

    return { success: false, errorMessage: "User not found" };
};

export const getUserByEmail = async (email: string) => {
    try {
        const [rows] = await pool.query<any[]>(
            "SELECT * FROM users WHERE email = ? LIMIT 1",
            [email]
        );
        if (rows.length > 0) {
            return {
                success: true,
                user: rows[0] as User
            };
        }
        return { success: false, errorMessage: "User not found" };
    } catch (err: any) {
        return { success: false, errorMessage: err.message };
    }
};

export const getUserByGoogleId = async (googleId: string) => {
    try {
        const [rows] = await pool.query<any[]>(
            "SELECT * FROM users WHERE google_id = ? LIMIT 1",
            [googleId]
        );
        if (rows.length > 0) {
            return {
                success: true,
                user: rows[0] as User
            };
        }
        return { success: false, errorMessage: "User not found" };
    } catch (err: any) {
        return { success: false, errorMessage: err.message };
    }
};

export const logLoginActivity = async (userId: string | null, status: 'success' | 'failed', ip: string, userAgent: string) => {
    try {
        const id = generateId();
        await pool.query(
            "INSERT INTO login_activity (id, user_id, status, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
            [id, userId, status, ip, userAgent]
        );
    } catch (err: any) {
        console.error('Error logging login activity:', err.message);
    }
};
