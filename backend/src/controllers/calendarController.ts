import { Request, Response } from "express";
import { pool } from "../db/db";
import { getUserByCode } from "../services/userSevices";
import { User } from "../types/userType";
import generateId from "../utils/generateId";

export const getLogs = async (req: Request, res: Response) => {
    const { userCode } = req.params;
    const reqUser = await getUserByCode(userCode);
    if (!reqUser.success || !reqUser.user) {
        return res.json({
            success: false,
            errorMessage: "User not valid.",
        });
    }
    const user: User = reqUser.user;
    try {
        const [logs] = await pool.query<any[]>(`
            SELECT id, sushi_count, created_at
            FROM sushi_logs
            WHERE user_id = ?
        `, [user.id]);

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

export const upsertLog = async (req: Request, res: Response) => {
    const { userCode, sushiCount, createdAt, updatedAt } = req.body;
    const reqUser = await getUserByCode(userCode);
    if (!reqUser.success || !reqUser.user) {
        return res.json({
            success: false,
            errorMessage: "User not valid.",
        });
    }
    const user: User = reqUser.user;
    try {
        const formattedCreatedAt = (new Date(createdAt)).toISOString().slice(0, 19).replace('T', ' ');
        const formattedUpdatedAt = (new Date(updatedAt)).toISOString().slice(0, 19).replace('T', ' ');

        const [existingLogs] = await pool.query<any[]>(`
            SELECT id
            FROM sushi_logs
            WHERE user_id = ?
                AND created_at = ?
        `, [user.id, formattedCreatedAt]);


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
            `, [generateId(), user.id, sushiCount, formattedCreatedAt, formattedUpdatedAt]);
        } else {
            const logId = existingLogs[0].id;
            await pool.query(`
                UPDATE sushi_logs
                SET sushi_count = ?, updated_at = ?
                WHERE id = ?
            `, [sushiCount, formattedUpdatedAt, logId]);
        }

        const [logs] = await pool.query<any[]>(`
            SELECT id, sushi_count, created_at
            FROM sushi_logs
            WHERE user_id = ?
        `, [user.id]);

        const logsToReturn = logs.map((log: any) => ({
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
