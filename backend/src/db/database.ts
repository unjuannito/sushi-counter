import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

export default db;

/**
 * Simple query wrapper to maintain compatibility with existing async/await code.
 * It does not include complex regex for array expansion.
 */
export const query = async <T = any>(sql: string, params: any[] = []): Promise<[T, any]> => {
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const rows = stmt.all(...params) as T;
      return [rows, null];
    } else {
      const result = stmt.run(...params);
      return [result as any, null];
    }
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

export const pool = {
  query
};
