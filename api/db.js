'use strict';

/**
 * JSON File Storage Engine for Render/cloud deployment.
 * No native modules required — works on any Node 18+ environment.
 *
 * All amounts are stored as integers (paise = INR × 100) to avoid
 * floating-point rounding errors.
 */

const fs   = require('fs');
const path = require('path');
require('dotenv').config();

const DB_DIR    = path.resolve(process.env.DB_PATH || './data');
const JSON_FILE = path.join(DB_DIR, 'transactions.json');

// ── Initialise data directory & seed file ─────────────────────────────────────
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(JSON_FILE)) {
  fs.writeFileSync(
    JSON_FILE,
    JSON.stringify({ transactions: [] }, null, 2),
    'utf8'
  );
}

console.log('✅ JSON file store ready:', JSON_FILE);

// ── Read ──────────────────────────────────────────────────────────────────────
function readAll() {
  try {
    const raw = fs.readFileSync(JSON_FILE, 'utf8');
    return JSON.parse(raw).transactions || [];
  } catch {
    return [];
  }
}

// ── Write (atomic tmp-rename) ─────────────────────────────────────────────────
function writeAll(transactions) {
  try {
    const tmp = JSON_FILE + '.tmp';
    fs.writeFileSync(
      tmp,
      JSON.stringify({ transactions }, null, 2),
      'utf8'
    );
    fs.renameSync(tmp, JSON_FILE);
  } catch (err) {
    console.error('JSON write error:', err.message);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
module.exports = { readAll, writeAll, JSON_FILE };
