import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Landmark,
  Home,
  Fuel,
  GraduationCap,
  BookOpen,
  Music,
  Laptop,
  CreditCard,
  Trash2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { formatINR, formatDate, filterTransactionsByTimeframe } from '../utils/helpers';
import { useApp } from '../context/AppContext';
import { deleteTransaction as apiDeleteTransaction } from '../api/client';
import toast from 'react-hot-toast';

function getCategoryIcon(category, type) {
  if (type === 'income') return Landmark;
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('mess')) return ShoppingBag;
  if (cat.includes('hostel') || cat.includes('rent')) return Home;
  if (cat.includes('transport') || cat.includes('bus') || cat.includes('metro')) return Fuel;
  if (cat.includes('education') || cat.includes('book')) return BookOpen;
  if (cat.includes('entertainment') || cat.includes('movie')) return Music;
  if (cat.includes('freelance') || cat.includes('tech')) return Laptop;
  if (cat.includes('scholarship')) return GraduationCap;
  return CreditCard;
}

function getIconTheme(category, type) {
  if (type === 'income') {
    return { bg: 'rgba(0, 229, 153, 0.12)', color: '#00e599' };
  }
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('mess')) {
    return { bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316' };
  }
  if (cat.includes('hostel') || cat.includes('rent')) {
    return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' };
  }
  if (cat.includes('transport')) {
    return { bg: 'rgba(234, 179, 8, 0.12)', color: '#eab308' };
  }
  if (cat.includes('entertainment')) {
    return { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' };
  }
  return { bg: 'rgba(255, 77, 109, 0.12)', color: '#ff4d6d' };
}

export default function VaultRecentTransactions({ limit = 5, timeframe = null }) {
  const { transactions, refreshAll } = useApp();
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const displayList = React.useMemo(() => {
    let list = transactions;
    if (timeframe) {
      list = filterTransactionsByTimeframe(transactions, timeframe);
    }
    return list.slice(0, limit);
  }, [transactions, timeframe, limit]);

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiDeleteTransaction(toDelete.id);
      toast.success('Transaction deleted');
      setToDelete(null);
      await refreshAll();
    } catch {
      toast.error('Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="vault-recent-card" aria-label="Recent Transactions">
      {/* Header */}
      <div className="vault-card-header flex-between">
        <div>
          <h3 className="vault-card-title">Recent Transactions</h3>
          <p className="vault-card-subtitle">Last {displayList.length} operations</p>
        </div>
        <Link to="/history" className="vault-view-all-link">
          <span>View all →</span>
        </Link>
      </div>

      {/* Transaction List Rows */}
      <div className="vault-tx-list">
        {displayList.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 10px' }}>
            <p className="empty-state__text">No operations recorded yet.</p>
          </div>
        ) : (
          displayList.map((tx) => {
            const Icon = getCategoryIcon(tx.category, tx.type);
            const theme = getIconTheme(tx.category, tx.type);
            const isIncome = tx.type === 'income';

            return (
              <div key={tx.id} className="vault-tx-row">
                {/* Left: Icon square */}
                <div
                  className="vault-tx-icon-box"
                  style={{ background: theme.bg, color: theme.color }}
                >
                  <Icon size={17} />
                </div>

                {/* Middle: Title & Date */}
                <div className="vault-tx-info">
                  <span className="vault-tx-title" title={tx.description || tx.category}>
                    {tx.description || tx.category}
                  </span>
                  <span className="vault-tx-date">
                    {formatDate(tx.transaction_date)}
                  </span>
                </div>

                {/* Middle Right: Category Badge */}
                <div className="vault-tx-badge-col">
                  <span
                    className={`vault-tx-badge ${isIncome ? 'vault-badge-income' : 'vault-badge-category'}`}
                  >
                    {isIncome ? 'Income' : tx.category}
                  </span>
                </div>

                {/* Right: Colored Bold Amount */}
                <div className="vault-tx-amount-col">
                  <span className={`vault-tx-amount ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {isIncome ? '+' : '−'}
                    {formatINR(tx.amount)}
                  </span>
                </div>

                {/* Delete button (subtle) */}
                <button
                  className="vault-tx-del-btn"
                  onClick={() => setToDelete(tx)}
                  title="Delete transaction"
                  aria-label={`Delete ${tx.description || tx.category}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Modal */}
      {toDelete && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="flex items-center gap-sm mb-sm text-danger">
              <AlertTriangle size={20} />
              <h3 style={{ fontSize: 16, color: '#fff' }}>Delete Operation?</h3>
            </div>
            <p style={{ color: '#8f96a3', fontSize: 13, marginBottom: 16 }}>
              Are you sure you want to permanently delete{' '}
              <strong style={{ color: '#fff' }}>
                {toDelete.description || toDelete.category} ({formatINR(toDelete.amount)})
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-xs">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
