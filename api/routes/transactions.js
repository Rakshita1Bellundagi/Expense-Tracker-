'use strict';

const express = require('express');
const router = express.Router();

const {
  createTransactionRules,
  deleteTransactionRules,
  formatValidationErrors,
} = require('../middleware/validators');

const {
  createTransaction,
  getAllTransactions,
  deleteTransaction,
  transactionExists,
  getCategories,
} = require('../services/transactionService');

// ─── GET /api/transactions ───────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const transactions = getAllTransactions();
    res.json({ success: true, data: transactions, count: transactions.length });
  } catch (err) {
    console.error('GET /transactions error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve transactions' });
  }
});

// ─── POST /api/transactions ──────────────────────────────────────────────────
router.post(
  '/',
  createTransactionRules,
  formatValidationErrors,
  (req, res) => {
    try {
      const { type, amount, category, transaction_date, description } = req.body;
      const transaction = createTransaction({ type, amount, category, transaction_date, description });
      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (err) {
      console.error('POST /transactions error:', err);
      res.status(500).json({ success: false, message: 'Failed to save transaction' });
    }
  }
);

// ─── DELETE /api/transactions/:id ────────────────────────────────────────────
router.delete(
  '/:id',
  deleteTransactionRules,
  formatValidationErrors,
  (req, res) => {
    try {
      const { id } = req.params;

      if (!transactionExists(id)) {
        return res.status(404).json({
          success: false,
          message: `Transaction with id "${id}" not found`,
        });
      }

      const deleted = deleteTransaction(id);
      if (!deleted) {
        return res.status(500).json({ success: false, message: 'Deletion failed unexpectedly' });
      }

      res.json({ success: true, message: 'Transaction deleted successfully', id });
    } catch (err) {
      console.error('DELETE /transactions/:id error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete transaction' });
    }
  }
);

// ─── GET /api/transactions/categories ────────────────────────────────────────
router.get('/categories', (req, res) => {
  try {
    res.json({ success: true, data: getCategories() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
  }
});

module.exports = router;
