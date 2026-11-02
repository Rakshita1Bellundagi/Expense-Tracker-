'use strict';

/**
 * JSON File Storage Engine with Automatic Seed Data for Cloud Deployment.
 * All amounts are stored as integers (paise = INR × 100).
 */

const fs   = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch (_) {}

const DB_DIR    = path.resolve(process.env.DB_PATH || './data');
const JSON_FILE = path.join(DB_DIR, 'transactions.json');

const INITIAL_TRANSACTIONS = [
  {
    id: "9f0fb2d4-7909-4695-80e5-dd793a134a6d",
    type: "expense",
    amount: 1000000,
    category: "Education & Books",
    transaction_date: "2026-10-31",
    description: "College Half fees",
    created_at: "2026-10-31T15:11:36.506Z",
    updated_at: "2026-10-31T15:11:36.506Z"
  },
  {
    id: "3a945ba1-ff85-462c-bfb9-a134e8a1df18",
    type: "income",
    amount: 2000000,
    category: "Scholarship",
    transaction_date: "2026-10-31",
    description: "credited",
    created_at: "2026-10-31T15:10:30.028Z",
    updated_at: "2026-10-31T15:10:30.028Z"
  },
  {
    id: "dd4630d5-da4c-4486-93e6-e19e0199126c",
    type: "income",
    amount: 250000,
    category: "Other",
    transaction_date: "2026-10-26",
    description: "Mess bill",
    created_at: "2026-10-26T06:28:51.391Z",
    updated_at: "2026-10-26T06:28:51.391Z"
  },
  {
    id: "934ed9b5-a761-4600-b360-91b7354cc40f",
    type: "expense",
    amount: 22000,
    category: "Transport",
    transaction_date: "2026-10-23",
    description: "Auto rickshaw ride from station",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "46e0e11f-0347-47c6-8979-1415f393aaf8",
    type: "expense",
    amount: 38000,
    category: "Food & Mess",
    transaction_date: "2026-10-21",
    description: "Late night maggi & cold coffee study prep",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "12e70828-a950-4792-b05d-6590172c3453",
    type: "expense",
    amount: 25000,
    category: "Health & Fitness",
    transaction_date: "2026-10-19",
    description: "Campus clinic pharmacy multivitamins",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "2caa01b3-fc90-445b-9e5c-3a77356ad73d",
    type: "income",
    amount: 100000,
    category: "Gifts",
    transaction_date: "2026-10-18",
    description: "Birthday gift from uncle",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "9956ea46-973e-466d-9f11-ad09cd6765ff",
    type: "expense",
    amount: 95000,
    category: "Shopping",
    transaction_date: "2026-10-17",
    description: "College hoodie & laptop backpack",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "9da3dac0-f709-4531-b729-1ec1edbc6392",
    type: "expense",
    amount: 65000,
    category: "Education & Books",
    transaction_date: "2026-10-15",
    description: "Web Development course certification",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "f3d79b3f-0f37-46e4-a3d2-250a2608edcc",
    type: "income",
    amount: 150000,
    category: "Freelance",
    transaction_date: "2026-10-14",
    description: "Frontend bug fixing gig",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "cc0f1498-fc9b-4584-893f-caebb8fe1d94",
    type: "expense",
    amount: 40000,
    category: "Entertainment",
    transaction_date: "2026-10-12",
    description: "Weekend movie ticket with batchmates",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "d5086390-141f-4b75-87c4-763e2ded40b6",
    type: "income",
    amount: 250000,
    category: "Part-time",
    transaction_date: "2026-10-10",
    description: "Class 10 Math tutoring fee",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "fd43a9be-555a-46c8-8153-6530507882b5",
    type: "expense",
    amount: 32000,
    category: "Food & Mess",
    transaction_date: "2026-10-09",
    description: "Campus cafeteria coffee & samosas",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "5a59ed1d-bafd-4b59-807e-a6bc52146d19",
    type: "expense",
    amount: 16000,
    category: "Stationery & Print",
    transaction_date: "2026-10-08",
    description: "OS lab manual binding & printouts",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "9ce72a23-e132-401c-aa34-cf129826de08",
    type: "expense",
    amount: 29900,
    category: "Recharge & Wi-Fi",
    transaction_date: "2026-10-07",
    description: "Monthly mobile 5G data plan",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "a602512f-c3ae-42a8-b738-2465f5ad729e",
    type: "expense",
    amount: 85000,
    category: "Education & Books",
    transaction_date: "2026-10-06",
    description: "Database Systems textbook & notebooks",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "34ea104f-b45c-4740-8e73-de6073fef441",
    type: "income",
    amount: 400000,
    category: "Scholarship",
    transaction_date: "2026-10-05",
    description: "State merit scholarship stipend",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "aec9356d-a20b-414c-af64-100d472658bf",
    type: "expense",
    amount: 45000,
    category: "Transport",
    transaction_date: "2026-10-04",
    description: "Monthly student bus pass renewal",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "b61823a3-9af8-4f60-ac53-72d9c0e2ce50",
    type: "expense",
    amount: 180000,
    category: "Food & Mess",
    transaction_date: "2026-10-03",
    description: "College mess monthly meal plan",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "f8920909-5b4a-4928-b218-38039c31ad8d",
    type: "expense",
    amount: 450000,
    category: "Hostel & Rent",
    transaction_date: "2026-10-02",
    description: "Hostel room sharing fee & electricity",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "31090a85-7ddd-4b67-8d02-6871301fd5c6",
    type: "income",
    amount: 1000000,
    category: "Allowance",
    transaction_date: "2026-10-01",
    description: "Monthly pocket money from parents",
    created_at: "2026-10-26T06:13:44.469Z",
    updated_at: "2026-10-26T06:13:44.469Z"
  },
  {
    id: "a4af4f5f-8cba-48ab-bd1f-84b5e2940315",
    type: "expense",
    amount: 10000,
    category: "Recharge & Wi-Fi",
    transaction_date: "2026-10-31",
    description: "Net pack",
    created_at: "2026-10-31T16:12:07.517Z",
    updated_at: "2026-10-31T16:12:07.517Z"
  }
];

// ── Ensure directories & seed file ───────────────────────────────────────────
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function initStore() {
  if (!fs.existsSync(JSON_FILE)) {
    fs.writeFileSync(
      JSON_FILE,
      JSON.stringify({ transactions: INITIAL_TRANSACTIONS }, null, 2),
      'utf8'
    );
    console.log('✅ Initialized store with authentic student transactions.');
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
      if (!data.transactions || data.transactions.length === 0) {
        fs.writeFileSync(
          JSON_FILE,
          JSON.stringify({ transactions: INITIAL_TRANSACTIONS }, null, 2),
          'utf8'
        );
        console.log('✅ Seeded store because it was empty.');
      }
    } catch {
      fs.writeFileSync(
        JSON_FILE,
        JSON.stringify({ transactions: INITIAL_TRANSACTIONS }, null, 2),
        'utf8'
      );
    }
  }
}

initStore();
console.log('✅ JSON file store ready:', JSON_FILE);

// ── Read ──────────────────────────────────────────────────────────────────────
function readAll() {
  try {
    if (!fs.existsSync(JSON_FILE)) {
      initStore();
    }
    const raw = fs.readFileSync(JSON_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.transactions || parsed.transactions.length === 0) {
      initStore();
      return INITIAL_TRANSACTIONS;
    }
    return parsed.transactions;
  } catch (err) {
    console.error('JSON read error, returning default seeds:', err.message);
    return INITIAL_TRANSACTIONS;
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
module.exports = { readAll, writeAll, JSON_FILE, INITIAL_TRANSACTIONS };
