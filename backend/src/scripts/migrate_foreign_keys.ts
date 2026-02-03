import db from '../db/database';

const migrate = () => {
  try {
    console.log('Starting foreign key migration...');

    // Disable foreign keys temporarily to allow table recreation
    db.pragma('foreign_keys = OFF');

    const tablesToMigrate = [
      {
        name: 'tournaments',
        createSql: `
          CREATE TABLE tournaments_new (
            id TEXT PRIMARY KEY,
            owner_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'open',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
          )
        `,
        columns: 'id, owner_id, status, created_at'
      },
      {
        name: 'participants',
        createSql: `
          CREATE TABLE participants_new (
            user_id TEXT NOT NULL,
            tournament_id TEXT NOT NULL,
            sushi_count INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, tournament_id),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
            FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE ON UPDATE CASCADE
          )
        `,
        columns: 'user_id, tournament_id, sushi_count'
      },
      {
        name: 'sushi_logs',
        createSql: `
          CREATE TABLE sushi_logs_new (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            sushi_count INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
          )
        `,
        columns: 'id, user_id, sushi_count, created_at, updated_at'
      }
    ];

    for (const table of tablesToMigrate) {
      // Check if table exists
      const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table.name);
      
      if (exists) {
        console.log(`Migrating table ${table.name}...`);
        
        // 1. Create new table
        db.exec(table.createSql);
        
        // 2. Copy data
        db.exec(`INSERT INTO ${table.name}_new (${table.columns}) SELECT ${table.columns} FROM ${table.name}`);
        
        // 3. Drop old table
        db.exec(`DROP TABLE ${table.name}`);
        
        // 4. Rename new table to original name
        db.exec(`ALTER TABLE ${table.name}_new RENAME TO ${table.name}`);
        
        console.log(`Table ${table.name} migrated successfully.`);
      } else {
        console.log(`Table ${table.name} does not exist, skipping.`);
      }
    }

    // Re-enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Verify foreign keys are enabled
    const fkEnabled = db.pragma('foreign_keys', { simple: true });
    console.log(`Foreign keys are now: ${fkEnabled === 1 ? 'ON' : 'OFF'}`);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    // Try to re-enable foreign keys even if it failed
    db.pragma('foreign_keys = ON');
    process.exit(1);
  }
};

migrate();
