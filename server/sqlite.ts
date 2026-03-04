import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'health-data.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS symptom_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symptoms TEXT NOT NULL,
    description TEXT,
    risk_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    possible_conditions TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    explanation TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expired INTEGER NOT NULL
  );
`);

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const newHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === newHash;
}

export type DbUser = {
  id: number;
  name: string;
  username: string;
  password: string;
  is_admin: number;
  created_at: string;
};

// Seed admin user on startup
// Migrate: add is_admin column if missing (for existing DBs)
try {
  db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
} catch (_) { /* column already exists */ }

// Migrate: add guardian_email column if missing
try {
  db.exec("ALTER TABLE users ADD COLUMN guardian_email TEXT DEFAULT NULL");
} catch (_) { /* column already exists */ }

const existingAdmin = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
if (!existingAdmin) {
  const hashed = hashPassword('123');
  db.prepare("INSERT INTO users (name, username, password, is_admin) VALUES (?, ?, ?, ?)").run('Admin', 'admin', hashed, 1);
  console.log('Admin user created (username: admin, password: 123)');
}

export { db as sqliteDb };
