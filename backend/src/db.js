'use strict';

/**
 * Persistent Database Engine supporting both SQLite (data/expense_tracker.db)
 * and JSON file storage (data/transactions.json).
 *
 * All amounts are stored as integers (paise = INR × 100) to avoid
 * floating-point rounding errors.
 */

const fs   = require('fs');
const path = require('path');
require('dotenv').config();

const DB_DIR     = path.resolve(process.env.DB_PATH || './data');
const JSON_FILE  = path.join(DB_DIR, 'transactions.json');
const SQLITE_FILE = path.join(DB_DIR, 'expense_tracker.db');

// ─── Initialise Directories ──────────────────────────────────────────────────
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(JSON_FILE)) {
  fs.writeFileSync(JSON_FILE, JSON.stringify({ transactions: [] }, null, 2), 'utf8');
}

// ─── SQLite Integration (node:sqlite built-in in Node v24) ────────────────────
let sqliteDb = null;
try {
  const { DatabaseSync } = require('node:sqlite');
  sqliteDb = new DatabaseSync(SQLITE_FILE);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      transaction_date TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
} catch (err) {
  console.warn('SQLite warning (falling back to JSON store):', err.message);
}

// ─── Read / Write helpers ────────────────────────────────────────────────────

function readAll() {
  if (sqliteDb) {
    try {
      const rows = sqliteDb.prepare('SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC').all();
      return rows;
    } catch {
      // fallback to JSON
    }
  }

  try {
    const raw = fs.readFileSync(JSON_FILE, 'utf8');
    return JSON.parse(raw).transactions || [];
  } catch {
    return [];
  }
}

function writeAll(transactions) {
  // 1. Write to SQLite database
  if (sqliteDb) {
    try {
      sqliteDb.exec('BEGIN TRANSACTION;');
      sqliteDb.exec('DELETE FROM transactions;');
      const stmt = sqliteDb.prepare(`
        INSERT INTO transactions (id, type, amount, category, transaction_date, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of transactions) {
        stmt.run(
          t.id,
          t.type,
          t.amount,
          t.category,
          t.transaction_date,
          t.description || '',
          t.created_at,
          t.updated_at
        );
      }
      sqliteDb.exec('COMMIT;');
    } catch (err) {
      try { sqliteDb.exec('ROLLBACK;'); } catch (_) {}
      console.error('SQLite write error:', err.message);
    }
  }

  // 2. Atomic write to JSON backup file
  try {
    const tmp = JSON_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ transactions }, null, 2), 'utf8');
    fs.renameSync(tmp, JSON_FILE);
  } catch (err) {
    console.error('JSON file write error:', err.message);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

module.exports = {
  readAll,
  writeAll,
  SQLITE_FILE,
  JSON_FILE,
};
