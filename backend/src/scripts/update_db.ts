import db from '../db/database';

const updateDb = () => {
  try {
    console.log('Updating database schema...');

    // Add new columns to users table if they don't exist
    const columns = [
      { name: 'email', type: 'TEXT' },
      { name: 'password', type: 'TEXT' },
      { name: 'google_id', type: 'TEXT' },
      { name: 'google_email', type: 'TEXT' },
      { name: 'reset_token', type: 'TEXT' },
      { name: 'reset_token_expiry', type: 'TEXT' },
      { name: 'token_version', type: 'INTEGER DEFAULT 0' },
      { name: 'refresh_token', type: 'TEXT' }
    ];

    for (const col of columns) {
      try {
        db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Column ${col.name} added successfully.`);
      } catch (err: any) {
        if (err.message.includes('duplicate column name')) {
          console.log(`Column ${col.name} already exists.`);
        } else {
          console.error(`Error adding column ${col.name}:`, err.message);
        }
      }
    }

    // Create unique indexes
    try {
      db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL`);
      db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL`);
      console.log('Unique indexes created.');
    } catch (err: any) {
      console.error('Error creating unique indexes:', err.message);
    }

    // Create login_activity table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS login_activity (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        login_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        status TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    console.log('login_activity table checked/created.');

    // Fix null created_at or status in tournaments
    try {
      db.exec(`UPDATE tournaments SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL OR created_at = ''`);
      db.exec(`UPDATE tournaments SET status = 'open' WHERE status IS NULL OR status = ''`);
      console.log('Fixed null created_at or status in tournaments.');
    } catch (err: any) {
      console.error('Error fixing tournaments data:', err.message);
    }

    // Fix null sushi_count in participants
    try {
      db.exec(`UPDATE participants SET sushi_count = 0 WHERE sushi_count IS NULL`);
      console.log('Fixed null sushi_count in participants.');
    } catch (err: any) {
      console.error('Error fixing participants sushi_count:', err.message);
    }

    // Ensure foreign keys are enabled in the database for the future
    try {
      db.pragma('foreign_keys = ON');
      console.log('Foreign keys enabled.');
    } catch (err: any) {
      console.error('Error enabling foreign keys:', err.message);
    }

    console.log('Database update completed.');
  } catch (error) {
    console.error('Error updating database:', error);
  }
};

updateDb();
