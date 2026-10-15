import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import '../config/loadEnv';

const projectRoot = path.resolve(__dirname, '../../../');
const configuredDbPath = process.env.DATABASE_URL;
const dbPath = configuredDbPath
  ? path.isAbsolute(configuredDbPath)
    ? configuredDbPath
    : path.resolve(projectRoot, configuredDbPath)
  : path.resolve(__dirname, '../../database.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
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
