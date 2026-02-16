import db from '../db/database';
import fs from 'fs';
import path from 'path';

const migrateAll = async () => {
  try {
    console.log('🚀 Iniciando migración completa de la base de datos...');

    // 1. Deshabilitar foreign keys para permitir recreación de tablas
    db.pragma('foreign_keys = OFF');
    console.log('🔹 Foreign keys desactivadas temporalmente.');

    // 2. Ejecutar schema.sql para asegurar que las tablas existan
    console.log('🔹 Ejecutando schema.sql...');
    const schemaPath = path.resolve(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);

    // 3. Ejecutar correcciones de datos y columnas básicas (basado en update_db.ts)
    console.log('🔹 Aplicando parches de datos y columnas...');
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
      } catch (err: any) {
        // Ignorar error si la columna ya existe
      }
    }

    // Fix data
    db.exec(`UPDATE tournaments SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL OR created_at = ''`);
    db.exec(`UPDATE tournaments SET status = 'open' WHERE status IS NULL OR status = ''`);
    db.exec(`UPDATE participants SET sushi_count = 0 WHERE sushi_count IS NULL`);
    console.log('✅ Parches de datos aplicados.');

    // 4. Recrear tablas para asegurar claves foráneas y esquema exacto
    console.log('🔹 Recreando tablas para asegurar integridad (Foreign Keys)...');
    
    // Función helper para migrar tablas detectando columnas existentes
    const migrateTable = (tableName: string, createSql: string, targetColumns: string[]) => {
      const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
      if (exists) {
        console.log(`🔹 Migrando tabla ${tableName}...`);
        
        // 1. Obtener columnas existentes en la tabla original
        const existingColumnsInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
        const existingColumns = existingColumnsInfo.map(c => c.name);
        
        // 2. Crear tabla temporal
        db.exec(createSql.replace(`${tableName}_new`, `${tableName}_backup`));
        
        // 3. Construir el SELECT dinámicamente
        // Si la columna existe, la usamos. Si no, usamos un valor por defecto o NULL
        const selectParts = targetColumns.map(col => {
          if (existingColumns.includes(col)) {
            return col;
          } else {
            // Valores por defecto para columnas nuevas específicas
            if (col === 'status' && tableName === 'participants') return "'active' as status";
            if (col === 'status' && tableName === 'tournaments') return "'open' as status";
            if (col === 'created_at') return "CURRENT_TIMESTAMP as created_at";
            if (col === 'sushi_count') return "0 as sushi_count";
            if (col === 'token_version') return "0 as token_version";
            return `NULL as ${col}`;
          }
        });

        try {
            const columnsStr = targetColumns.join(', ');
            const selectStr = selectParts.join(', ');
            
            db.exec(`INSERT INTO ${tableName}_backup (${columnsStr}) SELECT ${selectStr} FROM ${tableName}`);
            db.exec(`DROP TABLE ${tableName}`);
            db.exec(`ALTER TABLE ${tableName}_backup RENAME TO ${tableName}`);
            console.log(`✅ Tabla ${tableName} migrada exitosamente.`);
        } catch (e: any) {
            console.error(`❌ Error migrando ${tableName}:`, e.message);
            db.exec(`DROP TABLE IF EXISTS ${tableName}_backup`);
        }
      }
    };

    // Usuarios
    migrateTable('users', `
      CREATE TABLE users_new (
        id TEXT PRIMARY KEY,
        code TEXT,
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
    `, ['id', 'code', 'name', 'email', 'password', 'google_id', 'google_email', 'reset_token', 'reset_token_expiry', 'token_version', 'refresh_token']);

    // Torneos
    migrateTable('tournaments', `
      CREATE TABLE tournaments_new (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `, ['id', 'owner_id', 'status', 'created_at']);

    // Participantes
    migrateTable('participants', `
      CREATE TABLE participants_new (
        user_id TEXT NOT NULL,
        tournament_id TEXT NOT NULL,
        sushi_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        PRIMARY KEY (user_id, tournament_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `, ['user_id', 'tournament_id', 'sushi_count', 'status']);

    // Sushi Logs
    migrateTable('sushi_logs', `
      CREATE TABLE sushi_logs_new (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        sushi_count INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `, ['id', 'user_id', 'sushi_count', 'created_at', 'updated_at']);

    // 5. Re-habilitar foreign keys
    db.pragma('foreign_keys = ON');
    console.log('✅ Foreign keys activadas.');

    // 6. Índices finales
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL`);
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL`);

    console.log('🎉 Migración completada con éxito.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    db.pragma('foreign_keys = ON');
    process.exit(1);
  }
};

migrateAll();
