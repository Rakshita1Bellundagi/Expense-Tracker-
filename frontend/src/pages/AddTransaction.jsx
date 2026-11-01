import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';

export default function AddTransaction() {
  return (
    <main className="page" id="add-transaction-page">
      {/* ── Page header ── */}
      <div className="page-header">
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: 'var(--space-md)', display: 'inline-flex' }}>
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Dashboard
        </Link>
        <h1 className="page-title">Add Transaction</h1>
        <p className="page-subtitle">Record a new income or expense entry</p>
      </div>

      {/* ── Form card ── */}
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card__header">
          <h2 className="card__title">Transaction Details</h2>
          <span className="text-muted text-sm">Fields marked * are required</span>
        </div>
        <div className="card__body">
          <TransactionForm />
        </div>
      </div>

      {/* ── Tips ── */}
      <div
        style={{
          marginTop: 'var(--space-lg)',
          maxWidth: 720,
          background: 'rgba(56,189,248,0.06)',
          border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-md) var(--space-lg)',
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.8,
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--color-accent)', marginBottom: 4 }}>💡 Tips</p>
        <ul style={{ paddingLeft: 'var(--space-md)' }}>
          <li>All entries are validated on the server, so financial totals are always accurate.</li>
          <li>You can add a short description to help identify the transaction later.</li>
          <li>Transactions can be deleted from the Transaction History page.</li>
        </ul>
      </div>
    </main>
  );
}
