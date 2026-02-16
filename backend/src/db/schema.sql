-- Schema for SQLite

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
);

-- Login activity table
CREATE TABLE IF NOT EXISTS login_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  login_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL, -- 'success', 'failed'
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'calculating', 'closed'
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  user_id TEXT NOT NULL,
  tournament_id TEXT NOT NULL,
  sushi_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  PRIMARY KEY (user_id, tournament_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Sushi logs table
CREATE TABLE IF NOT EXISTS sushi_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  sushi_count INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
);
