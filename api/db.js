'use strict';

/**
 * Persistent Database Engine using better-sqlite3 with JSON fallback.
 * Works on Node 18+ (no built-in node:sqlite required).
 *
 * All amounts are stored as integers (paise = INR × 100) to avoid
 * floating-point rounding errors.
 */

const fs   = require('fs');
const path = require('path');
require('dotenv').config();

const DB_DIR      = path.resolve(process.env.DB_PATH || './data');
const JSON_FILE   = path.join(DB_DIR, 'transactions.json');
const SQLITE_FILE = path.join(DB_DIR, 'expense_tracker.db');

// ──────────────────────────────────────────────────────────────────────────────
// Initialise data directory & JSON seed file
// ──────────────────────────────────────────────────────────────────────────────
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(JSON_FILE)) {
  fs.writeFileSync(JSON_FILE, JSON.stringify({ transactions: [] }, null, 2), 'utf8');
}

// ──────────────────────────────────────────────────────────────────────────────
// SQLite via better-sqlite3 (falls back to JSON if unavailable)
// ──────────────────────────────────────────────────────────────────────────────
let sqliteDb = null;
try {
  const Database = require('better-sqlite3');
  sqliteDb = new Database(SQLITE_FILE);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id               TEXT PRIMARY KEY,
      type             TEXT NOT NULL,
      amount           INTEGER NOT NULL,
      category         TEXT NOT NULL,
      transaction_date TEXT NOT NULL,
      description      TEXT,
      created_at       TEXT NOT NULL,
      updated_at       TEXT NOT NULL
    );
  `);
  console.log('✅ SQLite (better-sqlite3) connected');
} catch (err) {
  console.warn('⚠️  SQLite unavailable – using JSON store:', err.message);
}

// ──────────────────────────────────────────────────────────────────────────────
// Read / Write helpers
// ──────────────────────────────────────────────────────────────────────────────

function readAll() {
  if (sqliteDb) {
    try {
      return sqliteDb
        .prepare('SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC')
        .all();
    } catch (err) {
      console.error('SQLite read error, falling back to JSON:', err.message);
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
  // 1. Write to SQLite
  if (sqliteDb) {
    try {
      const insert = sqliteDb.prepare(`
        INSERT INTO transactions (id, type, amount, category, transaction_date, description, created_at, updated_at)
        VALUES (@id, @type, @amount, @category, @transaction_date, @description, @created_at, @updated_at)
      `);

      const replaceAll = sqliteDb.transaction((rows) => {
        sqliteDb.exec('DELETE FROM transactions;');
        for (const t of rows) {
          insert.run({
            id:               t.id,
            type:             t.type,
            amount:           t.amount,
            category:         t.category,
            transaction_date: t.transaction_date,
            description:      t.description || '',
            created_at:       t.created_at,
            updated_at:       t.updated_at,
          });
        }
      });

      replaceAll(transactions);
    } catch (err) {
      console.error('SQLite write error:', err.message);
    }
  }

  // 2. Atomic JSON backup
  try {
    const tmp = JSON_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ transactions }, null, 2), 'utf8');
    fs.renameSync(tmp, JSON_FILE);
  } catch (err) {
    console.error('JSON file write error:', err.message);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────
module.exports = {
  readAll,
  writeAll,
  SQLITE_FILE,
  JSON_FILE,
};
