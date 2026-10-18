import { pool } from '../db/db';
import { config } from '../config/config';

export const initScheduler = () => {
    const run = async () => {
        try {
            const sql = `
                DELETE FROM users 
                WHERE deletion_requested_at IS NOT NULL 
                AND (julianday('now') - julianday(deletion_requested_at)) >= ?
            `;
            await pool.query(sql, [config.accountDeletionDays]);
        } catch (error) {
        }
    };

    run(); // Run on startup
    setInterval(run, 24 * 60 * 60 * 1000); // 24 hours
};
