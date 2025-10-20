import { Router } from "express";
import { pool } from "../db";
import { getUserByCode } from "../services/userSevices";
import { User } from "../types/userType";
import { RowDataPacket } from "mysql2";
import { log } from "console";
import generateId from "../utils/generateId";


export const calendarRouter = Router();

calendarRouter.get("/logs/:userCode", async (req, res) => {
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
        // Obtener todos los torneos donde participa el usuario
        const [logs] = await pool.query<RowDataPacket[]>(`
            SELECT id, sushi_count, created_at
            FROM sushi_logs
            WHERE user_id = ?
        `, [user.id]);

        const logsToReturn = logs.map((log: RowDataPacket) => ({
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

});
calendarRouter.post("/logs/upsert", async (req, res) => {
    console.log("Received upsert log request:", req.body);
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
        console.log("Upsert log for user:", user.id, "sushiCount:", sushiCount, "createdAt:", formattedCreatedAt, "updatedAt:", formattedUpdatedAt);

        // Ejecutar consulta usando el rango
        const [existingLogs] = await pool.query<RowDataPacket[]>(`
            SELECT id
            FROM sushi_logs
            WHERE user_id = ?
                AND created_at = ?
        `, [user.id, formattedCreatedAt]);


        if (sushiCount == 0) {
            console.log("Sushi count is 0, checking for existing logs to delete.");
            console.log("Existing logs found:", existingLogs);
            console.log("createdAt to delete:", formattedCreatedAt);
            if (existingLogs.length !== 0) {
                //eliminar los registros que tengan 0 sushi y no existan
                await pool.query(`
                    DELETE FROM sushi_logs
                    WHERE id = ?
                `, [existingLogs[0].id]);
            }
        } else if (existingLogs.length === 0) {
            const [insertResult] = await pool.query<RowDataPacket[]>(`
                INSERT INTO sushi_logs (id, user_id, sushi_count, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            `, [generateId(), user.id, sushiCount, formattedCreatedAt, formattedUpdatedAt]);
        } else {
            console.log("Existing log found, updating:", existingLogs[0].id);
            const logId = existingLogs[0].id;
            const [updateResult] = await pool.query<RowDataPacket[]>(`
                UPDATE sushi_logs
                SET sushi_count = ?, updated_at = ?
                WHERE id = ?
            `, [sushiCount, formattedUpdatedAt, logId]);
        }

        // Obtener todos los torneos donde participa el usuario
        const [logs] = await pool.query<RowDataPacket[]>(`
            SELECT id, sushi_count, created_at
            FROM sushi_logs
            WHERE user_id = ?
        `, [user.id]);

        const logsToReturn = logs.map((log: RowDataPacket) => ({
            id: log.id,
            sushiCount: log.sushi_count,
            createdAt: log.created_at,
        }));


        return res.json({
            success: true,
            logs: logsToReturn
        });

    } catch (error: any) {
        console.error("Error upserting log:", error);
        return res.json({
            success: false,
            errorMessage: error.message,
        });
    }
});