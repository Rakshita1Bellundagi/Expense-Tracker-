import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Tag, FileText, Save, X } from 'lucide-react';
import { createTransaction } from '../api/client';
import {
  CATEGORIES,
  validateAmount,
  validateDate,
  todayISO,
  getApiError,
} from '../utils/helpers';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  type:             'expense',
  amount:           '',
  category:         '',
  transaction_date: todayISO(),
  description:      '',
};

const INITIAL_ERRORS = {
  type: '', amount: '', category: '', transaction_date: '', description: '',
};

export default function TransactionForm({ onSuccess }) {
  const navigate     = useNavigate();
  const { refreshAll } = useApp();

  const [form,     setForm]     = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState(INITIAL_ERRORS);
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const setField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
    setApiError('');
    // Reset category when type changes
    if (field === 'type') setForm(f => ({ ...f, type: value, category: '' }));
  };

  const validate = () => {
    const e = { ...INITIAL_ERRORS };
    let valid = true;

    if (!form.type) { e.type = 'Please select a transaction type'; valid = false; }

    const amtErr = validateAmount(form.amount);
    if (amtErr) { e.amount = amtErr; valid = false; }

    if (!form.category) { e.category = 'Please select a category'; valid = false; }

    const dateErr = validateDate(form.transaction_date);
    if (dateErr) { e.transaction_date = dateErr; valid = false; }

    if (form.description && form.description.length > 500) {
      e.description = 'Description must not exceed 500 characters'; valid = false;
    }

    setErrors(e);
    return valid;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setSaving(true);
    try {
      await createTransaction({
        type:             form.type,
        amount:           parseFloat(form.amount),
        category:         form.category,
        transaction_date: form.transaction_date,
        description:      form.description.trim(),
      });

      toast.success('Transaction saved successfully! 🎉');
      await refreshAll();

      setForm(INITIAL_FORM);
      setErrors(INITIAL_ERRORS);

      if (onSuccess) onSuccess();
      else navigate('/history');
    } catch (err) {
      const msg = getApiError(err);
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/');

  const availableCategories = CATEGORIES[form.type] || [];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <form
      id="transaction-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Add transaction form"
    >
      {/* API-level error banner */}
      {apiError && (
        <div
          role="alert"
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.30)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 'var(--space-lg)',
            color: 'var(--color-danger)',
            fontSize: 14,
          }}
        >
          ⚠️ {apiError}
        </div>
      )}

      {/* ── Transaction type toggle ── */}
      <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
        <label className="form-label">
          Transaction Type <span aria-hidden="true">*</span>
        </label>
        <div className="type-toggle" role="group" aria-label="Select transaction type">
          <button
            id="type-income-btn"
            type="button"
            className={`type-btn income${form.type === 'income' ? ' active' : ''}`}
            onClick={() => setField('type', 'income')}
            aria-pressed={form.type === 'income'}
          >
            <TrendingUp size={17} aria-hidden="true" />
            Income
          </button>
          <button
            id="type-expense-btn"
            type="button"
            className={`type-btn expense${form.type === 'expense' ? ' active' : ''}`}
            onClick={() => setField('type', 'expense')}
            aria-pressed={form.type === 'expense'}
          >
            <TrendingDown size={17} aria-hidden="true" />
            Expense
          </button>
        </div>
        {errors.type && <p className="form-error" role="alert">⚠ {errors.type}</p>}
      </div>

      {/* ── Amount & Category ── */}
      <div className="form-grid" style={{ marginBottom: 'var(--space-lg)' }}>
        {/* Amount */}
        <div className="form-group">
          <label htmlFor="amount-input" className="form-label">
            Amount (₹) <span aria-hidden="true">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <DollarSign
              size={16}
              aria-hidden="true"
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="amount-input"
              type="number"
              className={`form-input${errors.amount ? ' error' : ''}`}
              style={{ paddingLeft: 36 }}
              value={form.amount}
              onChange={e => setField('amount', e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              max="10000000"
              aria-required="true"
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              aria-invalid={!!errors.amount}
            />
          </div>
          {errors.amount && <p id="amount-error" className="form-error" role="alert">⚠ {errors.amount}</p>}
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category-select" className="form-label">
            Category <span aria-hidden="true">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Tag
              size={16}
              aria-hidden="true"
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            <select
              id="category-select"
              className={`form-select${errors.category ? ' error' : ''}`}
              style={{ paddingLeft: 36 }}
              value={form.category}
              onChange={e => setField('category', e.target.value)}
              aria-required="true"
              aria-describedby={errors.category ? 'category-error' : undefined}
              aria-invalid={!!errors.category}
            >
              <option value="">Select category…</option>
              {availableCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {errors.category && <p id="category-error" className="form-error" role="alert">⚠ {errors.category}</p>}
        </div>
      </div>

      {/* ── Date & Description ── */}
      <div className="form-grid" style={{ marginBottom: 'var(--space-lg)' }}>
        {/* Date */}
        <div className="form-group">
          <label htmlFor="date-input" className="form-label">
            Date <span aria-hidden="true">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Calendar
              size={16}
              aria-hidden="true"
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="date-input"
              type="date"
              className={`form-input${errors.transaction_date ? ' error' : ''}`}
              style={{ paddingLeft: 36 }}
              value={form.transaction_date}
              onChange={e => setField('transaction_date', e.target.value)}
              max={todayISO()}
              min="2000-01-01"
              aria-required="true"
              aria-describedby={errors.transaction_date ? 'date-error' : undefined}
              aria-invalid={!!errors.transaction_date}
            />
          </div>
          {errors.transaction_date && (
            <p id="date-error" className="form-error" role="alert">⚠ {errors.transaction_date}</p>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description-input" className="form-label">
            Description <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <FileText
              size={16}
              aria-hidden="true"
              style={{
                position: 'absolute', left: 12, top: 12,
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="description-input"
              type="text"
              className={`form-input${errors.description ? ' error' : ''}`}
              style={{ paddingLeft: 36 }}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="e.g. Monthly rent, Salary…"
              maxLength={500}
              aria-describedby={errors.description ? 'desc-error' : 'desc-hint'}
            />
          </div>
          <p id="desc-hint" className="text-muted text-sm" style={{ marginTop: 2 }}>
            {form.description.length}/500
          </p>
          {errors.description && (
            <p id="desc-error" className="form-error" role="alert">⚠ {errors.description}</p>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-md" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
        <button
          id="cancel-form-btn"
          type="button"
          className="btn btn-secondary"
          onClick={handleCancel}
          disabled={saving}
        >
          <X size={16} aria-hidden="true" />
          Cancel
        </button>
        <button
          id="submit-transaction-btn"
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? (
            <><span className="spinner" style={{ width: 18, height: 18 }} /> Saving…</>
          ) : (
            <><Save size={17} aria-hidden="true" /> Save Transaction</>
          )}
        </button>
      </div>
    </form>
  );
}
