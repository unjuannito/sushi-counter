import { pool } from '../db/db';
import { config } from '../config/config';

export const initScheduler = () => {
    const run = async () => {
        try {
            console.log(`[Scheduler] Checking for accounts scheduled for deletion...`);
            const sql = `
                DELETE FROM users 
                WHERE deletion_requested_at IS NOT NULL 
                AND (julianday('now') - julianday(deletion_requested_at)) >= ?
            `;
            const [result] = await pool.query(sql, [config.accountDeletionDays]);
            if (result && result.changes > 0) {
                console.log(`[Scheduler] Deleted ${result.changes} accounts.`);
            }
        } catch (error) {
            console.error('[Scheduler] Error running account deletion task:', error);
        }
    };

    run(); // Run on startup
    setInterval(run, 24 * 60 * 60 * 1000); // 24 hours
};
