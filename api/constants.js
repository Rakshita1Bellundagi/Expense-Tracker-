'use strict';

/**
 * Shared constants for allowed categories and transaction types.
 * Used by both validators and the frontend (via the API response).
 */

const TRANSACTION_TYPES = ['income', 'expense'];

const CATEGORIES = {
  income: [
    'Allowance',
    'Scholarship',
    'Part-time',
    'Freelance',
    'Gifts',
    'Salary',
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

const ALL_CATEGORIES = Array.from(new Set([
  ...CATEGORIES.income,
  ...CATEGORIES.expense,
  'Food',
  'Education',
  'Bills',
  'Health',
]));

const MAX_DESCRIPTION_LENGTH = 500;

// Maximum supported amount in rupees (10 crore)
const MAX_AMOUNT_INR = 10_000_000;

module.exports = {
  TRANSACTION_TYPES,
  CATEGORIES,
  ALL_CATEGORIES,
  MAX_DESCRIPTION_LENGTH,
  MAX_AMOUNT_INR,
};
