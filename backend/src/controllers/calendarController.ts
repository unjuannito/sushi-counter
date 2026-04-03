import { Request, Response } from "express";
import { pool } from "../db/db";
import { User } from "../types/userType";
import generateId from "../utils/generateId";

export const getLogs = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        const [logs] = await pool.query<any[]>(`
            SELECT id, sushi_count, created_at
            FROM sushi_logs
            WHERE user_id = ?
        `, [userId]);

        const logsToReturn = logs.map((log: any) => ({
            id: log.id,
            sushiCount: log.sushi_count,
            createdAt: log.created_at,
        }));
        return res.json({
            success: true,
            logs: logsToReturn,
        });
    } catch (err: any) {
        return res.json({
            success: false,
            errorMessage: err.message,
        });
    }
};

export const getLogsByDay = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { date } = req.params; // Expecting YYYY-MM-DD

    try {
        const [logs] = await pool.query<any[]>(`
            SELECT id, sushi_count, created_at
            FROM sushi_logs
            WHERE user_id = ? AND DATE(created_at) = DATE(?)
        `, [userId, date]);

        const logsToReturn = logs.map((log: any) => ({
            id: log.id,
            sushiCount: log.sushi_count,
            createdAt: log.created_at,
        }));

        return res.json({
            success: true,
            logs: logsToReturn,
        });
    } catch (err: any) {
        return res.json({
            success: false,
            errorMessage: err.message,
        });
    }
};

export const getLogsByMonth = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { year, month } = req.params; // Expecting year and month

    try {
        const [logs] = await pool.query<any[]>(`
            SELECT id, sushi_count, created_at
            FROM sushi_logs
            WHERE user_id = ? 
              AND strftime('%Y', created_at) = ? 
              AND strftime('%m', created_at) = ?
        `, [userId, year, month.padStart(2, '0')]);

        const logsToReturn = logs.map((log: any) => ({
            id: log.id,
            sushiCount: log.sushi_count,
            createdAt: log.created_at,
        }));

        return res.json({
            success: true,
            logs: logsToReturn,
        });
    } catch (err: any) {
        return res.json({
            success: false,
            errorMessage: err.message,
        });
    }
};

export const deleteLog = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    try {
        await pool.query(`
            DELETE FROM sushi_logs
            WHERE id = ? AND user_id = ?
        `, [id, userId]);

        return res.json({
            success: true,
        });
    } catch (err: any) {
        return res.json({
            success: false,
            errorMessage: err.message,
        });
    }
};

export const upsertLog = async (req: Request, res: Response) => {
    const { sushiCount, createdAt, updatedAt } = req.body;
    const userId = (req as any).user.id;

    try {
        // Use the strings directly as they are already formatted as YYYY-MM-DD HH:mm:ss by the frontend
        const formattedCreatedAt = createdAt;
        const formattedUpdatedAt = updatedAt;

        const [existingLogs] = await pool.query<any[]>(`
            SELECT id
            FROM sushi_logs
            WHERE user_id = ?
                AND created_at = ?
        `, [userId, formattedCreatedAt]);

        if (sushiCount == 0) {
            if (existingLogs.length !== 0) {
                await pool.query(`
                    DELETE FROM sushi_logs
                    WHERE id = ?
                `, [existingLogs[0].id]);
            }
        } else if (existingLogs.length === 0) {
            await pool.query(`
                INSERT INTO sushi_logs (id, user_id, sushi_count, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            `, [generateId(), userId, sushiCount, formattedCreatedAt, formattedUpdatedAt]);
        } else {
            const logId = existingLogs[0].id;
            await pool.query(`
                UPDATE sushi_logs
                SET sushi_count = ?, updated_at = ?
                WHERE id = ?
            `, [sushiCount, formattedUpdatedAt, logId]);
        }

        // Return logs for the same day to update frontend state efficiently
        const dateStr = formattedCreatedAt.split(' ')[0];
        const [dayLogs] = await pool.query<any[]>(`
            SELECT id, sushi_count, created_at
            FROM sushi_logs
            WHERE user_id = ? AND DATE(created_at) = DATE(?)
        `, [userId, dateStr]);

        const logsToReturn = dayLogs.map((log: any) => ({
            id: log.id,
            sushiCount: log.sushi_count,
            createdAt: log.created_at,
        }));

        return res.json({
            success: true,
            logs: logsToReturn
        });

    } catch (error: any) {
        return res.json({
            success: false,
            errorMessage: error.message,
        });
    }
};
