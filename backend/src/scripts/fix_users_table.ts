import db from '../db/database';

const fixUsersTable = () => {
  try {
    console.log('Starting users table fix...');

    // Disable foreign keys temporarily
    db.pragma('foreign_keys = OFF');

    // 1. Check if users table exists
    const usersTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();

    if (!usersTable) {
      console.log('Users table does not exist. Running migrations to create it correctly...');
      // This might happen if the database is empty, but we expect it to exist if we are here
      return;
    }

    console.log('Recreating users table with correct schema...');

    // 2. Create new users table with correct schema
    db.exec(`
      CREATE TABLE users_new (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT,
        google_id TEXT UNIQUE,
        google_email TEXT,
        reset_token TEXT,
        reset_token_expiry TEXT,
        token_version INTEGER DEFAULT 0,
        refresh_token TEXT
      )
    `);

    // 3. Get existing columns to copy
    const columnsInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const existingColumns = columnsInfo.map(c => c.name).join(', ');
    
    console.log(`Copying data for columns: ${existingColumns}`);

    // 4. Copy data from old to new
    // We need to match columns that exist in both. 
    // The new table has all the columns we expect from schema.sql.
    db.exec(`INSERT INTO users_new (${existingColumns}) SELECT ${existingColumns} FROM users`);

    // 5. Drop old table
    db.exec('DROP TABLE users');

    // 6. Rename new table to users
    db.exec('ALTER TABLE users_new RENAME TO users');

    // 7. Re-create indexes if they were dropped (they are usually dropped when table is dropped)
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL`);
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL`);

    // 8. Re-enable foreign keys
    db.pragma('foreign_keys = ON');

    // Verify
    const fkEnabled = db.pragma('foreign_keys', { simple: true });
    console.log(`Foreign keys are now: ${fkEnabled === 1 ? 'ON' : 'OFF'}`);

    console.log('Users table fix completed successfully.');
  } catch (error) {
    console.error('Users table fix failed:', error);
    db.pragma('foreign_keys = ON');
    process.exit(1);
  }
};

fixUsersTable();
