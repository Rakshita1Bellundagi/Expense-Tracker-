import React, { useState } from 'react';
import { Target, Lightbulb, TrendingUp, Sparkles, Edit2, Check, X, Award, Zap, Compass } from 'lucide-react';
import { formatINR } from '../utils/helpers';
import { useApp } from '../context/AppContext';

export default function SavingsGoalAndInsights() {
  const { summary, summaryLoading, transactions } = useApp();

  // Savings goal state persisted in localStorage
  const [goalName, setGoalName] = useState(() => {
    return localStorage.getItem('student_savings_goal_name') || '🎓 Tech & Semester Fund';
  });

  const [targetAmount, setTargetAmount] = useState(() => {
    const val = localStorage.getItem('student_savings_goal_target');
    return val ? parseFloat(val) : 20000;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(goalName);
  const [tempTarget, setTempTarget] = useState(targetAmount.toString());

  // Real calculations from server database records
  const netSavings = summary ? parseFloat(summary.netSavings || '0') : 0;
  const currentSaved = Math.max(0, netSavings);
  const progressPercent = targetAmount > 0 ? Math.min(100, (currentSaved / targetAmount) * 100) : 0;
  const remainingToGoal = Math.max(0, targetAmount - currentSaved);
  const savingsRate = summary?.savingsRate ? parseFloat(summary.savingsRate) : 0;

  // Calculate daily burn rate based on transactions
  const dailyAverage = React.useMemo(() => {
    const totalExp = summary ? parseFloat(summary.totalExpenses || '0') : 0;
    // Assume active monthly span (approx 30 days)
    return totalExp > 0 ? (totalExp / 30).toFixed(2) : '0.00';
  }, [summary]);

  const topCategory = summary?.topExpenseCategory;

  const handleSave = (e) => {
    e.preventDefault();
    const t = parseFloat(tempTarget);
    if (!tempName.trim() || isNaN(t) || t <= 0) return;

    setGoalName(tempName.trim());
    setTargetAmount(t);
    localStorage.setItem('student_savings_goal_name', tempName.trim());
    localStorage.setItem('student_savings_goal_target', t.toString());
    setIsEditing(false);
  };

  return (
    <div className="savings-insights-container">
      {/* ── Left: Savings Goal Card ── */}
      <div className="card savings-goal-card" aria-label="Student savings goal">
        <div className="card__header flex-between">
          <div className="flex items-center gap-sm">
            <div className="goal-icon-badge">
              <Target size={18} className="text-savings" />
            </div>
            <div>
              <h3 className="card__title">{goalName}</h3>
              <span className="text-muted text-xs">Milestone Savings Goal</span>
            </div>
          </div>

          {!isEditing ? (
            <button
              id="edit-goal-btn"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setTempName(goalName);
                setTempTarget(targetAmount.toString());
                setIsEditing(true);
              }}
              title="Edit savings goal"
            >
              <Edit2 size={13} />
              <span>Edit Goal</span>
            </button>
          ) : (
            <div className="flex gap-xs">
              <button className="btn btn-primary btn-sm" onClick={handleSave} style={{ padding: '4px 8px' }}>
                <Check size={14} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(false)}
                style={{ padding: '4px 8px' }}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Edit Goal Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="goal-edit-form mb-md">
            <div className="flex flex-col gap-xs">
              <input
                type="text"
                className="form-input form-input-sm"
                placeholder="Goal name (e.g. Laptop Fund)"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
              <div className="flex gap-xs">
                <input
                  type="number"
                  className="form-input form-input-sm"
                  placeholder="Target (₹)"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  min="500"
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Save
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Goal Numbers */}
        <div className="goal-numbers-row flex-between items-baseline mb-sm">
          <div>
            <span className="text-xs text-muted block">Current Saved</span>
            <span className="goal-current-amount font-bold text-savings">
              {summaryLoading ? '…' : formatINR(currentSaved)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted block">Target</span>
            <span className="text-sm font-semibold text-primary-light">
              {formatINR(targetAmount)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="goal-progress-bar-track mb-xs">
          <div
            className="goal-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex-between text-xs text-muted mb-md">
          <span>{progressPercent.toFixed(1)}% Completed</span>
          <span>{formatINR(remainingToGoal)} remaining</span>
        </div>

        {/* Motivational status */}
        <div className="goal-badge-box">
          <Award size={15} className="text-amber-400 flex-shrink-0" />
          <span className="text-xs text-secondary">
            {progressPercent >= 100 ? (
              <strong className="text-income">🎉 Target achieved! Fantastic student financial management!</strong>
            ) : progressPercent >= 50 ? (
              <span>Over halfway to your goal! Keep maintaining your monthly allowance surplus.</span>
            ) : (
              <span>Consistent tracking brings you closer each week. Every rupee saved adds up!</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Right: Financial Insights Card ── */}
      <div className="card insights-card" aria-label="Dynamic student financial insights">
        <div className="card__header flex-between">
          <div className="flex items-center gap-sm">
            <div className="insight-icon-badge">
              <Lightbulb size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="card__title">Smart Financial Insights</h3>
              <span className="text-muted text-xs">Automated analysis from real records</span>
            </div>
          </div>
          <span className="badge badge-accent">Live Analysis</span>
        </div>

        <div className="insights-list">
          {/* Insight 1: Savings Rate */}
          <div className="insight-item">
            <div className="insight-item-icon bg-income-subtle">
              <TrendingUp size={16} className="text-income" />
            </div>
            <div className="insight-item-body">
              <span className="insight-item-title">
                Savings Rate: <strong className="text-income">{savingsRate}%</strong>
              </span>
              <p className="insight-item-text">
                {savingsRate >= 30 ? (
                  <>You are retaining <strong>{savingsRate}%</strong> of your student income. Outstanding financial health!</>
                ) : savingsRate >= 15 ? (
                  <>Good pace! You are maintaining a healthy surplus above the 15% student reserve benchmark.</>
                ) : (
                  <>Your net savings margin is slim. Consider setting daily canteen limits to expand your reserve.</>
                )}
              </p>
            </div>
          </div>

          {/* Insight 2: Top Expense Category */}
          {topCategory && (
            <div className="insight-item">
              <div className="insight-item-icon bg-expense-subtle">
                <Zap size={16} className="text-expense" />
              </div>
              <div className="insight-item-body">
                <span className="insight-item-title">
                  Top Spending Area:{' '}
                  <strong className="text-expense">{topCategory.category}</strong>
                </span>
                <p className="insight-item-text">
                  Accounts for <strong>{topCategory.percentage}%</strong> ({formatINR(topCategory.amount)}) of all recorded expenditures.
                </p>
              </div>
            </div>
          )}

          {/* Insight 3: Daily Average Burn */}
          <div className="insight-item">
            <div className="insight-item-icon bg-primary-subtle">
              <Compass size={16} className="text-primary" />
            </div>
            <div className="insight-item-body">
              <span className="insight-item-title">
                Estimated Daily Average:{' '}
                <strong>₹{dailyAverage} / day</strong>
              </span>
              <p className="insight-item-text">
                Based on your active monthly transactions across mess, transport, and college essentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
