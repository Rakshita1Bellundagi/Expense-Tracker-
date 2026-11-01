import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteTransaction } from '../api/client';
import { formatINR, formatDate, getApiError } from '../utils/helpers';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteModal({ transaction, onConfirm, onCancel, deleting }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal">
        <div className="flex gap-md" style={{ marginBottom: 'var(--space-md)', alignItems: 'flex-start' }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.12)',
            color: 'var(--color-danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="modal__title" id="delete-modal-title">Delete Transaction?</h2>
            <p className="modal__body" style={{ margin: 0 }}>
              This will permanently remove{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>
                {transaction.category} — {formatINR(transaction.amount)}
              </strong>{' '}
              on {formatDate(transaction.transaction_date)}.
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="modal__actions">
          <button
            id="cancel-delete-btn"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Trash2 size={15} />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TransactionRow({ transaction, onDelete }) {
  const isIncome = transaction.type === 'income';

  return (
    <tr>
      <td>
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {formatDate(transaction.transaction_date)}
        </span>
      </td>
      <td>
        <p style={{ fontWeight: 500, fontSize: 14 }}>
          {transaction.description || '—'}
        </p>
      </td>
      <td>
        <span className="badge badge-category">{transaction.category}</span>
      </td>
      <td>
        <span className={`badge badge-${transaction.type}`}>
          {isIncome ? '↑' : '↓'} {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
        </span>
      </td>
      <td>
        <span className={`amount-${transaction.type}`} style={{ fontSize: 15 }}>
          {isIncome ? '+' : '−'}{formatINR(transaction.amount)}
        </span>
      </td>
      <td>
        <button
          className="btn btn-icon btn-danger"
          onClick={() => onDelete(transaction)}
          aria-label={`Delete transaction ${transaction.description || transaction.category}`}
          title="Delete transaction"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────
export default function TransactionTable({ transactions, limit }) {
  const { refreshAll } = useApp();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const displayed = limit ? transactions.slice(0, limit) : transactions;

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteTransaction(pendingDelete.id);
      toast.success('Transaction deleted');
      await refreshAll();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="empty-state" id="empty-state">
        <div className="empty-state__icon">📭</div>
        <h3 className="empty-state__title">No transactions yet</h3>
        <p className="empty-state__text">
          Add your first income or expense to get started. Your financial history will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      {pendingDelete && (
        <DeleteModal
          transaction={pendingDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
          deleting={deleting}
        />
      )}

      <div className="table-wrapper">
        <table aria-label="Transaction history">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              <th scope="col">Category</th>
              <th scope="col">Type</th>
              <th scope="col">Amount</th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                onDelete={setPendingDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
