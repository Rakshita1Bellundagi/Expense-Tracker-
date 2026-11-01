import React, { useState } from 'react';
import { Wallet, AlertTriangle, CheckCircle, Edit3, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/helpers';
import { useApp } from '../context/AppContext';

export default function BudgetTracker() {
  const { summary, summaryLoading } = useApp();

  // Configurable budget stored in localStorage, default ₹15,000
  const [budget, setBudget] = useState(() => {
    try {
      const saved = localStorage.getItem('student_monthly_budget');
      return saved ? parseFloat(saved) : 15000;
    } catch {
      return 15000;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.toString());
  const [budgetError, setBudgetError] = useState('');

  // Spent amount from authoritative server summary
  const spent = summary?.currentMonthExpense ? parseFloat(summary.currentMonthExpense) : 0;
  const remaining = budget - spent;
  const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = remaining < 0;
  const isNearBudget = !isOverBudget && percentUsed >= 75;

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = parseFloat(tempBudget);
    if (isNaN(val) || val <= 0) {
      setBudgetError('Enter a valid amount > 0');
      return;
    }
    setBudget(val);
    localStorage.setItem('student_monthly_budget', val.toString());
    setIsEditing(false);
    setBudgetError('');
  };

  const handleCancel = () => {
    setTempBudget(budget.toString());
    setIsEditing(false);
    setBudgetError('');
  };

  // Status color helpers
  const getProgressColor = () => {
    if (isOverBudget) return 'var(--color-danger)';
    if (isNearBudget) return 'var(--color-warning)';
    return 'var(--color-income)';
  };

  return (
    <div className="budget-tracker-card" aria-label="Monthly budget tracker">
      {/* Header */}
      <div className="budget-header flex-between">
        <div className="flex items-center gap-sm">
          <div className="budget-icon-box">
            <Wallet size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="budget-title">Monthly Budget Tracker</h3>
            <span className="text-muted text-xs">
              {summary?.currentMonthKey ? `Month: ${summary.currentMonthKey}` : 'Current Month'}
            </span>
          </div>
        </div>

        {!isEditing ? (
          <button
            id="edit-budget-btn"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setTempBudget(budget.toString());
              setIsEditing(true);
            }}
            title="Edit monthly budget"
          >
            <Edit3 size={13} />
            <span>Set Limit</span>
          </button>
        ) : (
          <div className="flex items-center gap-xs">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSaveBudget}
              title="Save budget"
              style={{ padding: '4px 8px' }}
            >
              <Check size={14} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCancel}
              title="Cancel"
              style={{ padding: '4px 8px' }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Edit Budget Form Popover */}
      {isEditing && (
        <form onSubmit={handleSaveBudget} className="budget-edit-form">
          <label className="text-xs text-muted block mb-xs">
            Monthly Target Budget (₹):
          </label>
          <div className="flex gap-xs">
            <input
              type="number"
              className="form-input form-input-sm"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              placeholder="e.g. 15000"
              autoFocus
              min="100"
              step="100"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Save
            </button>
          </div>
          {budgetError && <span className="field-error text-xs">{budgetError}</span>}
        </form>
      )}

      {/* Three Metric Cards */}
      <div className="budget-metrics-grid">
        <div className="budget-metric">
          <span className="budget-metric-label">Target Budget</span>
          <span className="budget-metric-value">{formatINR(budget)}</span>
        </div>
        <div className="budget-metric">
          <span className="budget-metric-label">Total Spent</span>
          <span className="budget-metric-value text-expense">
            {summaryLoading ? '…' : formatINR(spent)}
          </span>
        </div>
        <div className="budget-metric">
          <span className="budget-metric-label">Remaining</span>
          <span
            className={`budget-metric-value ${isOverBudget ? 'text-danger font-bold' : 'text-income'}`}
          >
            {summaryLoading ? '…' : formatINR(Math.abs(remaining))}
            {isOverBudget && <span className="text-xs ml-xs">(Over)</span>}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="budget-progress-section">
        <div className="budget-progress-header flex-between text-xs mb-xs">
          <span className="text-muted">Utilization:</span>
          <span style={{ color: getProgressColor(), fontWeight: 600 }}>
            {percentUsed.toFixed(1)}% {isOverBudget ? 'Exceeded' : 'Spent'}
          </span>
        </div>

        <div className="budget-progress-track">
          <div
            className="budget-progress-fill"
            style={{
              width: `${Math.min(100, Math.max(0, percentUsed))}%`,
              background: isOverBudget
                ? 'linear-gradient(90deg, #f43f5e, #ef4444)'
                : isNearBudget
                ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                : 'linear-gradient(90deg, #10b981, #059669)',
            }}
          />
        </div>
      </div>

      {/* Warning or Status Banner */}
      {isOverBudget ? (
        <div className="budget-alert budget-alert-danger" role="alert">
          <ShieldAlert size={16} className="flex-shrink-0" />
          <span>
            <strong>Overspending Alert:</strong> Exceeded budget by{' '}
            <strong>{formatINR(Math.abs(remaining))}</strong>. Consider cutting back on non-essential categories like Entertainment or Shopping.
          </span>
        </div>
      ) : isNearBudget ? (
        <div className="budget-alert budget-alert-warning" role="alert">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>
            <strong>Caution:</strong> You have utilized{' '}
            <strong>{percentUsed.toFixed(1)}%</strong> of your monthly budget. Only{' '}
            <strong>{formatINR(remaining)}</strong> left for the remaining days.
          </span>
        </div>
      ) : (
        <div className="budget-alert budget-alert-success">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span>
            <strong>On Track:</strong> You have{' '}
            <strong>{formatINR(remaining)}</strong> left. Your student spending is well within your set limit.
          </span>
        </div>
      )}
    </div>
  );
}
