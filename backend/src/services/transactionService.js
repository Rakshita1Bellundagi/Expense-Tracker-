'use strict';

const { readAll, writeAll } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { CATEGORIES } = require('../constants');

/**
 * Convert stored integer (paise) → display string (rupees).
 * e.g. 2500000 paise → "25000.00"
 */
function paiseToRupees(paise) {
  return (paise / 100).toFixed(2);
}

/**
 * Convert rupee string/number → integer paise.
 * e.g. "250.50" → 25050
 */
function rupeesToPaise(rupees) {
  return Math.round(parseFloat(rupees) * 100);
}

/**
 * Format a raw DB record for the API response.
 */
function formatTransaction(row) {
  return {
    id:               row.id,
    type:             row.type,
    amount:           paiseToRupees(row.amount),
    category:         row.category,
    transaction_date: row.transaction_date,
    description:      row.description || '',
    created_at:       row.created_at,
    updated_at:       row.updated_at,
  };
}

// ─── Service functions ───────────────────────────────────────────────────────

/**
 * Create a new transaction. Returns the created record.
 */
function createTransaction({ type, amount, category, transaction_date, description }) {
  const transactions = readAll();

  const now = new Date().toISOString();
  const record = {
    id:               uuidv4(),
    type,
    amount:           rupeesToPaise(amount),
    category,
    transaction_date,
    description:      description || '',
    created_at:       now,
    updated_at:       now,
  };

  transactions.push(record);
  writeAll(transactions);

  return formatTransaction(record);
}

/**
 * Get all transactions, newest first (by date, then by created_at).
 */
function getAllTransactions() {
  const transactions = readAll();

  return transactions
    .sort((a, b) => {
      const dateDiff = b.transaction_date.localeCompare(a.transaction_date);
      if (dateDiff !== 0) return dateDiff;
      return b.created_at.localeCompare(a.created_at);
    })
    .map(formatTransaction);
}

/**
 * Delete a transaction by ID.
 * Returns true if deleted, false if not found.
 */
function deleteTransaction(id) {
  const transactions = readAll();
  const idx = transactions.findIndex((t) => t.id === id);
  if (idx === -1) return false;

  transactions.splice(idx, 1);
  writeAll(transactions);
  return true;
}

/**
 * Get financial summary computed from persisted records.
 * Totals are calculated server-side — not trusted from the browser.
 */
function getSummary() {
  const transactions = readAll();

  let incomePaise  = 0;
  let expensePaise = 0;

  const categoryPaise = {
    income: {},
    expense: {},
  };

  const monthlyPaise = {};

  for (const t of transactions) {
    const isIncome = t.type === 'income';
    const amount = t.amount;

    if (isIncome) {
      incomePaise += amount;
    } else {
      expensePaise += amount;
    }

    // Category breakdown
    const catGroup = isIncome ? categoryPaise.income : categoryPaise.expense;
    catGroup[t.category] = (catGroup[t.category] || 0) + amount;

    // Monthly breakdown (YYYY-MM)
    const monthKey = (t.transaction_date || '').slice(0, 7) || 'Unknown';
    if (!monthlyPaise[monthKey]) {
      monthlyPaise[monthKey] = { income: 0, expense: 0 };
    }
    if (isIncome) {
      monthlyPaise[monthKey].income += amount;
    } else {
      monthlyPaise[monthKey].expense += amount;
    }
  }

  const savingsPaise = incomePaise - expensePaise;
  const savingsRate = incomePaise > 0
    ? Math.max(0, ((savingsPaise / incomePaise) * 100)).toFixed(1)
    : '0.0';

  // Format category breakdown in rupees
  const categoriesBreakdown = {
    expense: {},
    income: {},
  };
  for (const [cat, p] of Object.entries(categoryPaise.expense)) {
    categoriesBreakdown.expense[cat] = paiseToRupees(p);
  }
  for (const [cat, p] of Object.entries(categoryPaise.income)) {
    categoriesBreakdown.income[cat] = paiseToRupees(p);
  }

  // Find top expense category
  let topExpenseCategory = null;
  let maxExpensePaise = 0;
  for (const [cat, p] of Object.entries(categoryPaise.expense)) {
    if (p > maxExpensePaise) {
      maxExpensePaise = p;
      topExpenseCategory = {
        category: cat,
        amount: paiseToRupees(p),
        percentage: expensePaise > 0 ? ((p / expensePaise) * 100).toFixed(1) : '0.0',
      };
    }
  }

  // Monthly breakdown sorted chronologically
  const monthsSorted = Object.keys(monthlyPaise)
    .sort()
    .map((monthKey) => {
      const data = monthlyPaise[monthKey];
      let label = monthKey;
      if (/^\d{4}-\d{2}$/.test(monthKey)) {
        const [y, m] = monthKey.split('-').map(Number);
        const d = new Date(y, m - 1, 1);
        label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      }
      return {
        monthKey,
        label,
        income: paiseToRupees(data.income),
        expense: paiseToRupees(data.expense),
        netSavings: paiseToRupees(data.income - data.expense),
      };
    });

  const latestMonthKey = monthsSorted.length > 0 ? monthsSorted[monthsSorted.length - 1].monthKey : null;
  const currentMonthExpense = latestMonthKey && monthlyPaise[latestMonthKey]
    ? paiseToRupees(monthlyPaise[latestMonthKey].expense)
    : paiseToRupees(expensePaise);

  return {
    totalIncome:          paiseToRupees(incomePaise),
    totalExpenses:        paiseToRupees(expensePaise),
    netSavings:           paiseToRupees(savingsPaise),
    savingsRate,
    currency:             'INR',
    transactionCount:     transactions.length,
    categoriesBreakdown,
    topExpenseCategory,
    monthlyBreakdown:     monthsSorted,
    currentMonthKey:      latestMonthKey,
    currentMonthExpense,
  };
}

/**
 * Check if a transaction ID exists.
 */
function transactionExists(id) {
  return readAll().some((t) => t.id === id);
}

/**
 * Return available categories.
 */
function getCategories() {
  return CATEGORIES;
}

module.exports = {
  createTransaction,
  getAllTransactions,
  deleteTransaction,
  getSummary,
  transactionExists,
  getCategories,
};
