'use strict';

const { body, param, validationResult } = require('express-validator');
const {
  TRANSACTION_TYPES,
  ALL_CATEGORIES,
  CATEGORIES,
  MAX_DESCRIPTION_LENGTH,
  MAX_AMOUNT_INR,
} = require('../constants');

/**
 * Formats express-validator errors into a consistent response shape.
 */
function formatValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

/**
 * Validates that a date string is a real calendar date (YYYY-MM-DD).
 * Rejects impossible dates such as 2023-02-31.
 */
function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) return false;
  const [y, m, day] = value.split('-').map(Number);
  return d.getFullYear() === y && d.getMonth() + 1 === m && d.getDate() === day;
}

// ─── Transaction creation rules ─────────────────────────────────────────────

const createTransactionRules = [
  body('type')
    .trim()
    .notEmpty().withMessage('Transaction type is required')
    .isIn(TRANSACTION_TYPES).withMessage(`Type must be one of: ${TRANSACTION_TYPES.join(', ')}`),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
    .custom((val) => {
      const n = parseFloat(val);
      if (!isFinite(n)) throw new Error('Amount must be a finite number');
      if (n > MAX_AMOUNT_INR) throw new Error(`Amount must not exceed ₹${MAX_AMOUNT_INR.toLocaleString('en-IN')}`);
      // Reject more than 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(String(val).trim())) {
        throw new Error('Amount must have at most 2 decimal places');
      }
      return true;
    }),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(ALL_CATEGORIES).withMessage(`Category must be one of the allowed values`)
    .custom((category, { req }) => {
      const type = req.body.type;
      if (type && TRANSACTION_TYPES.includes(type)) {
        const allowed = CATEGORIES[type] || [];
        if (!allowed.includes(category)) {
          throw new Error(`Category "${category}" is not valid for transaction type "${type}"`);
        }
      }
      return true;
    }),

  body('transaction_date')
    .trim()
    .notEmpty().withMessage('Transaction date is required')
    .custom((val) => {
      if (!isRealDate(val)) throw new Error('Transaction date must be a valid calendar date (YYYY-MM-DD)');
      // Optional: reject future dates more than 1 day ahead (clock skew tolerance)
      const inputDate = new Date(val + 'T00:00:00');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (inputDate > tomorrow) throw new Error('Transaction date cannot be in the future');
      // Reject dates before year 2000
      if (inputDate.getFullYear() < 2000) throw new Error('Transaction date must be after year 2000');
      return true;
    }),

  body('description')
    .optional({ checkFalsy: false })
    .trim()
    .isLength({ max: MAX_DESCRIPTION_LENGTH })
    .withMessage(`Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`),
];

const deleteTransactionRules = [
  param('id')
    .trim()
    .notEmpty().withMessage('Transaction ID is required'),
];

module.exports = {
  createTransactionRules,
  deleteTransactionRules,
  formatValidationErrors,
};
