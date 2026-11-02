'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5180',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5180',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    callback(null, true);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Root Route ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const acceptsHtml = req.accepts('html');
  const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5180';

  if (acceptsHtml) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Expense Tracker API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 520px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); text-align: center; }
          .icon { font-size: 48px; margin-bottom: 16px; }
          h1 { margin: 0 0 8px 0; font-size: 24px; color: #38bdf8; }
          p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; }
          .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; transition: background 0.2s; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
          .btn:hover { background: #1d4ed8; }
          .endpoints { margin-top: 24px; padding-top: 20px; border-top: 1px solid #334155; text-align: left; }
          .endpoints h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 10px 0; }
          .endpoints a { display: block; color: #38bdf8; text-decoration: none; font-size: 13px; font-family: monospace; padding: 4px 0; }
          .endpoints a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">💰</div>
          <h1>Expense Tracker API is Live!</h1>
          <p>This is the <strong>Backend REST API</strong>. To access the web app portal, click the button below:</p>
          <a class="btn" href="${frontendUrl}">Open Frontend Web App (http://localhost:5180) →</a>
          <div class="endpoints">
            <h3>Backend API Endpoints:</h3>
            <a href="/api/health">GET /api/health (Server status)</a>
            <a href="/api/summary">GET /api/summary (Aggregated totals)</a>
            <a href="/api/transactions">GET /api/transactions (All records)</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  res.json({
    success: true,
    message: 'Expense Tracker API is running',
    frontend: frontendUrl,
    endpoints: {
      health: '/api/health',
      summary: '/api/summary',
      transactions: '/api/transactions',
    },
  });
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/summary', summaryRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'An unexpected error occurred' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Expense Tracker API is running`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
