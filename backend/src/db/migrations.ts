import fs from 'fs';
import path from 'path';
import db from './database';

export const runMigrations = () => {
  try {
    const schemaPath = path.resolve(__dirname, './schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);

    try {
      db.prepare("SELECT deletion_requested_at FROM users LIMIT 1").get();
    } catch (e: any) {
      if (e.message.includes('no such column')) {
        db.exec("ALTER TABLE users ADD COLUMN deletion_requested_at TEXT");
      }
    }
    
  } catch (error) {
    throw error;
  }
};

// If this file is run directly
if (require.main === module) {
  runMigrations();
}
