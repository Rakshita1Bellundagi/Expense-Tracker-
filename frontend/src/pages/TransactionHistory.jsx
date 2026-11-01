import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, X } from 'lucide-react';
import TransactionTable from '../components/TransactionTable';
import SummaryCards from '../components/SummaryCards';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/helpers';

const ALL_TYPES       = ['all', 'income', 'expense'];
const ALL_CATEGORIES  = ['all', ...CATEGORIES.income, ...CATEGORIES.expense];

export default function TransactionHistory() {
  const { transactions, loading } = useApp();

  const [search,   setSearch]   = useState('');
  const [typeFilter, setType]   = useState('all');
  const [catFilter, setCat]     = useState('all');

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return transactions.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (catFilter  !== 'all' && t.category !== catFilter)  return false;
      if (q) {
        const text = `${t.description} ${t.category} ${t.type}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, search, typeFilter, catFilter]);

  const hasFilters = search || typeFilter !== 'all' || catFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setType('all');
    setCat('all');
  };

  return (
    <main className="page" id="history-page">
      {/* ── Page header ── */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Transaction History</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <Link id="add-from-history-btn" to="/add" className="btn btn-primary">
          <PlusCircle size={17} aria-hidden="true" />
          Add Transaction
        </Link>
      </div>

      {/* ── Summary ── */}
      <SummaryCards />

      {/* ── Filters ── */}
      <div
        className="card mt-lg"
        style={{ marginBottom: 'var(--space-lg)' }}
      >
        <div className="card__body" style={{ padding: 'var(--space-md) var(--space-xl)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              gap: 'var(--space-sm)',
              alignItems: 'center',
            }}
          >
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                aria-hidden="true"
                style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="search-input"
                type="search"
                className="form-input"
                style={{ paddingLeft: 36, height: 38 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search description, category…"
                aria-label="Search transactions"
              />
            </div>

            {/* Type filter */}
            <select
              id="type-filter"
              className="form-select"
              style={{ width: 140, height: 38 }}
              value={typeFilter}
              onChange={e => setType(e.target.value)}
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Category filter */}
            <select
              id="category-filter"
              className="form-select"
              style={{ width: 160, height: 38 }}
              value={catFilter}
              onChange={e => setCat(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Clear */}
            {hasFilters && (
              <button
                id="clear-filters-btn"
                className="btn btn-secondary btn-sm"
                onClick={clearFilters}
                aria-label="Clear filters"
                style={{ height: 38, whiteSpace: 'nowrap' }}
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          {/* Result count */}
          {hasFilters && (
            <p className="text-muted text-sm" style={{ marginTop: 'var(--space-sm)' }}>
              Showing {filtered.length} of {transactions.length} transactions
            </p>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Transactions</h2>
          <span className="text-muted text-sm">Newest first</span>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-xl)' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />
            ))}
          </div>
        ) : (
          <TransactionTable transactions={filtered} />
        )}
      </div>
    </main>
  );
}
