'use strict';

/**
 * Seed script: populates the database with realistic sample student transactions.
 * Usage: npm run seed
 */

require('dotenv').config();
const { writeAll } = require('./db');
const { v4: uuidv4 } = require('uuid');

function rupeesToPaise(r) {
  return Math.round(parseFloat(r) * 100);
}

const studentSeeds = [
  // ─── Student Incomes ────────────────────────────────────────────────────────
  { type: 'income',  amount: 10000, category: 'Allowance',         date: '2026-10-01', desc: 'Monthly pocket money from parents' },
  { type: 'income',  amount: 4000,  category: 'Scholarship',       date: '2026-10-05', desc: 'State merit scholarship stipend' },
  { type: 'income',  amount: 2500,  category: 'Part-time',         date: '2026-10-10', desc: 'Class 10 Math tutoring fee' },
  { type: 'income',  amount: 1500,  category: 'Freelance',         date: '2026-10-14', desc: 'Frontend bug fixing gig' },
  { type: 'income',  amount: 1000,  category: 'Gifts',             date: '2026-10-18', desc: 'Birthday gift from uncle' },

  // ─── Student Expenses ───────────────────────────────────────────────────────
  { type: 'expense', amount: 4500,  category: 'Hostel & Rent',     date: '2026-10-02', desc: 'Hostel room sharing fee & electricity' },
  { type: 'expense', amount: 1800,  category: 'Food & Mess',        date: '2026-10-03', desc: 'College mess monthly meal plan' },
  { type: 'expense', amount: 450,   category: 'Transport',         date: '2026-10-04', desc: 'Monthly student bus pass renewal' },
  { type: 'expense', amount: 850,   category: 'Education & Books',  date: '2026-10-06', desc: 'Database Systems textbook & notebooks' },
  { type: 'expense', amount: 299,   category: 'Recharge & Wi-Fi',   date: '2026-10-07', desc: 'Monthly mobile 5G data plan' },
  { type: 'expense', amount: 160,   category: 'Stationery & Print', date: '2026-10-08', desc: 'OS lab manual binding & printouts' },
  { type: 'expense', amount: 320,   category: 'Food & Mess',        date: '2026-10-09', desc: 'Campus cafeteria coffee & samosas' },
  { type: 'expense', amount: 400,   category: 'Entertainment',     date: '2026-10-12', desc: 'Weekend movie ticket with batchmates' },
  { type: 'expense', amount: 650,   category: 'Education & Books',  date: '2026-10-15', desc: 'Web Development course certification' },
  { type: 'expense', amount: 950,   category: 'Shopping',          date: '2026-10-17', desc: 'College hoodie & laptop backpack' },
  { type: 'expense', amount: 250,   category: 'Health & Fitness',  date: '2026-10-19', desc: 'Campus clinic pharmacy multivitamins' },
  { type: 'expense', amount: 380,   category: 'Food & Mess',        date: '2026-10-21', desc: 'Late night maggi & cold coffee study prep' },
  { type: 'expense', amount: 220,   category: 'Transport',         date: '2026-10-23', desc: 'Auto rickshaw ride from station' },
];

const now = new Date().toISOString();

const newRecords = studentSeeds.map((s) => ({
  id:               uuidv4(),
  type:             s.type,
  amount:           rupeesToPaise(s.amount),
  category:         s.category,
  transaction_date: s.date,
  description:      s.desc,
  created_at:       now,
  updated_at:       now,
}));

// Overwrite with authentic student records
writeAll(newRecords);
console.log(`✅ Successfully seeded ${newRecords.length} student transactions.`);
process.exit(0);
