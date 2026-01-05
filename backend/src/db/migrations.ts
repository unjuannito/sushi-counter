import fs from 'fs';
import path from 'path';
import db from './database';

export const runMigrations = () => {
  try {
    const schemaPath = path.resolve(__dirname, './schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    
    console.log('Migrations executed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};

// If this file is run directly
if (require.main === module) {
  runMigrations();
}
