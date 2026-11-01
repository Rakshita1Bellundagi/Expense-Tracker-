/**
 * Shared constants mirrored from the backend.
 */

export const TRANSACTION_TYPES = ['income', 'expense'];

export const CATEGORIES = {
  income: [
    'Allowance',
    'Scholarship',
    'Part-time',
    'Freelance',
    'Gifts',
    'Other',
  ],
  expense: [
    'Food & Mess',
    'Education & Books',
    'Hostel & Rent',
    'Transport',
    'Recharge & Wi-Fi',
    'Stationery & Print',
    'Entertainment',
    'Shopping',
    'Health & Fitness',
    'Other',
  ],
};

export const MAX_AMOUNT    = 10_000_000;
export const MAX_DESC_LEN  = 500;

/**
 * Format a number as INR currency string.
 * e.g. 25000.00 → "₹25,000.00"
 */
export function formatINR(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a date string (YYYY-MM-DD) to a human-friendly display.
 * e.g. "2026-10-15" → "15 Oct 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Today's date in YYYY-MM-DD (local time).
 */
export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Validate amount string: must be positive number with ≤ 2 decimal places.
 * Returns null if valid, error string otherwise.
 */
export function validateAmount(val) {
  if (!val || val.toString().trim() === '') return 'Amount is required';
  const n = parseFloat(val);
  if (isNaN(n)) return 'Amount must be a number';
  if (n <= 0)   return 'Amount must be greater than zero';
  if (n > MAX_AMOUNT) return `Amount must not exceed ₹${MAX_AMOUNT.toLocaleString('en-IN')}`;
  if (!/^\d+(\.\d{1,2})?$/.test(val.toString().trim())) return 'Amount must have at most 2 decimal places';
  return null;
}

/**
 * Returns null if valid date string, error string otherwise.
 */
export function validateDate(val) {
  if (!val) return 'Date is required';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return 'Enter a valid date';
  const d = new Date(val + 'T00:00:00');
  if (isNaN(d.getTime())) return 'Enter a valid calendar date';
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  if (d > tomorrow) return 'Date cannot be in the future';
  if (d.getFullYear() < 2000) return 'Date must be after year 2000';
  return null;
}

/**
 * Extract a readable error message from an Axios error response.
 */
export function getApiError(err) {
  if (err?.response?.data?.errors?.length) {
    return err.response.data.errors.map(e => e.message).join('; ');
  }
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message === 'Network Error') return 'Cannot connect to the server. Is the backend running?';
  if (err?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  return err?.message || 'An unexpected error occurred';
}

/**
 * Filter transactions based on timeframe ('1W' | '1M' | '3M' | '1Y').
 */
export function filterTransactionsByTimeframe(transactions, timeframe) {
  if (!transactions || transactions.length === 0) return [];
  if (!timeframe) return transactions;

  const now = new Date();
  let refTime = now.getTime();
  for (const t of transactions) {
    if (t.transaction_date) {
      const tTime = new Date(t.transaction_date + 'T23:59:59').getTime();
      if (tTime > refTime) refTime = tTime;
    }
  }
  const refDate = new Date(refTime);
  const cutoff = new Date(refDate);

  if (timeframe === '1W') {
    cutoff.setDate(cutoff.getDate() - 7);
  } else if (timeframe === '1M') {
    cutoff.setDate(cutoff.getDate() - 30);
  } else if (timeframe === '3M') {
    cutoff.setDate(cutoff.getDate() - 90);
  } else if (timeframe === '1Y') {
    cutoff.setDate(cutoff.getDate() - 365);
  } else {
    return transactions;
  }

  const cutoffTime = cutoff.getTime();
  return transactions.filter((t) => {
    if (!t.transaction_date) return false;
    const tDate = new Date(t.transaction_date + 'T23:59:59').getTime();
    return tDate >= cutoffTime;
  });
}

/**
 * Calculate totals for a given list of transactions.
 */
export function calculateTransactionStats(transactionsList) {
  let income = 0;
  let expense = 0;
  const categoriesExpense = {};

  (transactionsList || []).forEach((t) => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'income') {
      income += amt;
    } else if (t.type === 'expense') {
      expense += amt;
      categoriesExpense[t.category] = (categoriesExpense[t.category] || 0) + amt;
    }
  });

  const netSavings = income - expense;
  const savingsRate = income > 0 ? Math.max(0, (netSavings / income) * 100) : 0;

  return {
    income,
    expense,
    netSavings,
    savingsRate,
    count: (transactionsList || []).length,
    categoriesExpense,
  };
}
