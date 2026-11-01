'use strict';

const express = require('express');
const router = express.Router();

const { getSummary } = require('../services/transactionService');

// ─── GET /api/summary ────────────────────────────────────────────────────────
// Returns totals computed from the database — not from browser-supplied values.
router.get('/', (req, res) => {
  try {
    const summary = getSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('GET /summary error:', err);
    res.status(500).json({ success: false, message: 'Failed to calculate summary' });
  }
});

module.exports = router;
