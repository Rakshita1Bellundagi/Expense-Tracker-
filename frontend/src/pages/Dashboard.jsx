import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  RefreshCw,
  Search,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import SummaryCards from '../components/SummaryCards';
import SpendingChart from '../components/SpendingChart';
import CategoryDonutChart from '../components/CategoryDonutChart';
import VaultRecentTransactions from '../components/VaultRecentTransactions';
import VaultSavingsGoals from '../components/VaultSavingsGoals';
import BudgetTracker from '../components/BudgetTracker';
import TransactionTable from '../components/TransactionTable';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/helpers';

export default function Dashboard() {
  const { transactions, loading, refreshAll, error } = useApp();
  const { user } = useAuth();

  const [timeframe, setTimeframe] = useState('3M'); // '1W' | '1M' | '3M' | '1Y'
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showBudgetCenter, setShowBudgetCenter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Dynamic greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = user ? user.name.split(' ')[0] : 'Alex';
  const userInitials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AJ';

  const allCategories = useMemo(() => {
    return Array.from(new Set([...CATEGORIES.income, ...CATEGORIES.expense]));
  }, []);

  // Filtered transactions for budget center
  const filteredList = useMemo(() => {
    let list = transactions;

    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      list = list.filter((t) => t.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          (t.description || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, typeFilter, categoryFilter, searchQuery]);

  return (
    <main className="vault-page-container" id="dashboard-page">
      {/* ── Top Vault Header ── */}
      <header className="vault-top-header">
        <div className="vault-greeting-wrap">
          <h1 className="vault-greeting-title">
            {greeting}, {displayName} <span className="greeting-emoji">👋</span>
          </h1>
        </div>

        <div className="vault-header-actions">
          {/* Timeframe pill selector */}
          <div className="vault-timeframe-group" role="group" aria-label="Timeframe selector">
            {['1W', '1M', '3M', '1Y'].map((tf) => (
              <button
                key={tf}
                className={`vault-timeframe-btn ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf)}
                type="button"
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Search Button */}
          <button
            className="vault-circle-btn"
            onClick={() => setShowSearchModal(!showSearchModal)}
            title="Search transactions"
            aria-label="Search transactions"
            type="button"
          >
            <Search size={16} />
          </button>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="vault-circle-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              title="Notifications"
              aria-label="Notifications"
              type="button"
            >
              <Bell size={16} />
              <span className="vault-notification-dot" />
            </button>

            {notificationsOpen && (
              <div className="vault-notifications-popover">
                <div className="vault-popover-header">
                  <span>Notifications</span>
                  <span className="badge badge-accent">1 new</span>
                </div>
                <div className="vault-popover-item">
                  <p className="vault-popover-text">
                    Monthly savings goal reached 53%! You saved ₹10,271 this month.
                  </p>
                  <span className="vault-popover-time">Just now</span>
                </div>
              </div>
            )}
          </div>

          {/* User Initials Avatar */}
          <div className="vault-header-avatar" title={user?.name || 'Alex Kumar'}>
            <span>{userInitials}</span>
          </div>

          {/* Quick Refresh */}
          <button
            className="vault-circle-btn"
            onClick={handleRefresh}
            title="Sync Database"
            aria-label="Sync Database"
            type="button"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-animation' : ''} />
          </button>
        </div>
      </header>

      {/* ── Quick Search Modal / Popover Bar ── */}
      {showSearchModal && (
        <div className="vault-search-bar-popover">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            className="vault-search-input"
            placeholder="Search any transaction, merchant, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearchModal(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* ── Server Error Notice ── */}
      {error && !loading && (
        <div className="server-error-banner" role="alert" style={{ marginBottom: 20 }}>
          <span>⚠️ {error}</span>
          <button className="btn btn-secondary btn-sm" onClick={refreshAll}>
            Retry
          </button>
        </div>
      )}

      {/* ── 1. Top 4 Summary Cards (Net Worth Hero + 3 Stat Cards) ── */}
      <SummaryCards timeframe={timeframe} />

      {/* ── 2. Middle Row: Cash Flow Overview (65%) & Spending Donut (35%) ── */}
      <div className="vault-middle-grid">
        <SpendingChart timeframe={timeframe} />
        <CategoryDonutChart timeframe={timeframe} />
      </div>

      {/* ── 3. Bottom Row: Recent Transactions (55%) & Savings Goals (45%) ── */}
      <div className="vault-bottom-grid">
        <VaultRecentTransactions limit={5} timeframe={timeframe} />
        <VaultSavingsGoals />
      </div>

      {/* ── 4. Expandable Student Budget & Management Hub ── */}
      <div className="vault-budget-center-section">
        <button
          className="vault-toggle-budget-btn"
          onClick={() => setShowBudgetCenter(!showBudgetCenter)}
          aria-expanded={showBudgetCenter}
        >
          <div className="flex items-center gap-sm">
            <SlidersHorizontal size={17} className="text-primary" />
            <span style={{ fontWeight: 600, color: '#fff' }}>
              Student Budget Tracker & Detailed Ledger
            </span>
            <span className="badge badge-accent">Interactive</span>
          </div>
          <div className="flex items-center gap-xs text-muted">
            <span>{showBudgetCenter ? 'Collapse' : 'Expand View'}</span>
            {showBudgetCenter ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showBudgetCenter && (
          <div className="vault-budget-center-content animate-fade-in">
            {/* Budget Tracker Component */}
            <div style={{ marginBottom: 24 }}>
              <BudgetTracker />
            </div>

            {/* Filter Bar and Table */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card__header flex-between flex-wrap gap-md">
                <div>
                  <h3 className="card__title">Complete Ledger Filter</h3>
                  <span className="text-muted text-xs">
                    Search, filter by income/expense type, and review student entries
                  </span>
                </div>
                <Link to="/add" className="btn btn-primary btn-sm">
                  <PlusCircle size={15} />
                  <span>Add Transaction</span>
                </Link>
              </div>

              {/* Filter controls */}
              <div className="dashboard-table-filters flex-between flex-wrap gap-sm">
                <div className="search-input-box">
                  <Search size={15} className="search-icon" />
                  <input
                    type="text"
                    className="form-input form-input-sm search-input"
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-xs flex-wrap">
                  <div className="filter-pill-group">
                    <button
                      className={`filter-pill ${typeFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setTypeFilter('all')}
                    >
                      All
                    </button>
                    <button
                      className={`filter-pill ${typeFilter === 'income' ? 'active' : ''}`}
                      onClick={() => setTypeFilter('income')}
                    >
                      Income
                    </button>
                    <button
                      className={`filter-pill ${typeFilter === 'expense' ? 'active' : ''}`}
                      onClick={() => setTypeFilter('expense')}
                    >
                      Expense
                    </button>
                  </div>

                  <select
                    className="form-input form-input-sm category-dropdown"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {allCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <TransactionTable transactions={filteredList} limit={10} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
