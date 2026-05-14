const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/grc.db');

let db;

function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT UNIQUE NOT NULL COLLATE NOCASE,
      name       TEXT NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'customer',
      student_id TEXT,
      phone      TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
      client_name   TEXT,
      client_email  TEXT,
      client_phone  TEXT,
      status        TEXT NOT NULL DEFAULT 'new',
      device        TEXT,
      serial        TEXT,
      technician    TEXT,
      parts_needed  TEXT,
      priority      TEXT NOT NULL DEFAULT 'med',
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ticket_updates (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id  INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      author     TEXT NOT NULL,
      kind       TEXT NOT NULL DEFAULT 'note',
      message    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS form_submissions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id  INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      form_type  TEXT NOT NULL,
      form_data  TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrate: add columns to existing databases
  const ticketCols = database.prepare("PRAGMA table_info(tickets)").all().map((c) => c.name);
  if (!ticketCols.includes('client_name'))  database.exec("ALTER TABLE tickets ADD COLUMN client_name  TEXT");
  if (!ticketCols.includes('client_email')) database.exec("ALTER TABLE tickets ADD COLUMN client_email TEXT");
  if (!ticketCols.includes('client_phone')) database.exec("ALTER TABLE tickets ADD COLUMN client_phone TEXT");
  if (!ticketCols.includes('parts_needed')) database.exec("ALTER TABLE tickets ADD COLUMN parts_needed TEXT");

  const updateCols = database.prepare("PRAGMA table_info(ticket_updates)").all().map((c) => c.name);
  if (!updateCols.includes('kind')) database.exec("ALTER TABLE ticket_updates ADD COLUMN kind TEXT NOT NULL DEFAULT 'note'");

  // Seed a default staff account on first run
  const staffExists = database
    .prepare("SELECT 1 FROM users WHERE role = 'staff' LIMIT 1")
    .get();

  if (!staffExists) {
    const hash = bcrypt.hashSync(process.env.STAFF_PASSWORD || 'grcstaff2026', 10);
    database
      .prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, 'staff')")
      .run(process.env.STAFF_EMAIL || 'staff@greenriver.edu', 'Shop Staff', hash);
    console.log('Default staff account created: staff@greenriver.edu / grcstaff2026');
  }
}

module.exports = { getDb, initDb };
