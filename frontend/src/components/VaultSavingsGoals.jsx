import React, { useState } from 'react';
import { formatINR } from '../utils/helpers';
import { Plus, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VaultSavingsGoals() {
  const { summary } = useApp();
  const netSavings = summary ? parseFloat(summary.netSavings || '10271') : 10271;

  // Goals list (persisted in localStorage or default)
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('vault_savings_goals');
      if (saved) return JSON.parse(saved);
    } catch (_) {}

    return [
      {
        id: 1,
        emoji: '🏠',
        name: 'New Apartment',
        current: netSavings > 0 ? netSavings : 18400,
        target: 25000,
        color: '#00e599', // Mint
        estimate: 'Est. June 2025',
      },
      {
        id: 2,
        emoji: '✈️',
        name: 'Japan Trip',
        current: 3200,
        target: 6000,
        color: '#00c2ff', // Electric Blue
        estimate: 'Est. August 2025',
      },
      {
        id: 3,
        emoji: '📈',
        name: 'Investment Fund',
        current: 8900,
        target: 20000,
        color: '#a855f7', // Purple
        estimate: 'Est. Dec 2025',
      },
      {
        id: 4,
        emoji: '🚗',
        name: 'New Car',
        current: 2100,
        target: 15000,
        color: '#ff4d6d', // Coral Red
        estimate: 'Est. Mar 2026',
      },
    ];
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newEmoji, setNewEmoji] = useState('🎯');
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const handleAddGoal = (e) => {
    e.preventDefault();
    const t = parseFloat(newTarget);
    if (!newName.trim() || isNaN(t) || t <= 0) return;

    const colors = ['#00e599', '#00c2ff', '#a855f7', '#fbbf24', '#ff4d6d'];
    const newGoal = {
      id: Date.now(),
      emoji: newEmoji || '🎯',
      name: newName.trim(),
      current: 0,
      target: t,
      color: colors[goals.length % colors.length],
      estimate: 'In progress',
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    localStorage.setItem('vault_savings_goals', JSON.stringify(updated));
    setNewName('');
    setNewTarget('');
    setShowAdd(false);
  };

  return (
    <div className="vault-goals-card" aria-label="Savings Goals">
      {/* Header */}
      <div className="vault-card-header flex-between">
        <div>
          <h3 className="vault-card-title">Savings Goals</h3>
          <p className="vault-card-subtitle">{goals.length} active goals</p>
        </div>
        <button
          className="vault-add-goal-btn"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus size={13} />
          <span>Add goal</span>
        </button>
      </div>

      {/* Add Goal Popover */}
      {showAdd && (
        <form onSubmit={handleAddGoal} className="vault-add-goal-form">
          <div className="flex gap-xs mb-xs">
            <input
              type="text"
              placeholder="Emoji"
              className="form-input form-input-sm"
              style={{ width: 50, textAlign: 'center' }}
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
            />
            <input
              type="text"
              placeholder="Goal title (e.g. MacBook Pro)"
              className="form-input form-input-sm flex-1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-xs">
            <input
              type="number"
              placeholder="Target (₹)"
              className="form-input form-input-sm flex-1"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              min="100"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Save
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      <div className="vault-goals-list">
        {goals.map((g) => {
          const percent = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;

          return (
            <div key={g.id} className="vault-goal-item">
              {/* Title & Target Amount */}
              <div className="flex-between items-baseline mb-xs">
                <div className="flex items-center gap-xs">
                  <span className="goal-emoji">{g.emoji}</span>
                  <span className="vault-goal-name">{g.name}</span>
                </div>
                <span className="vault-goal-target-text" style={{ color: g.color }}>
                  {formatINR(g.current)} / {formatINR(g.target)}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="vault-goal-track">
                <div
                  className="vault-goal-fill"
                  style={{
                    width: `${percent}%`,
                    background: g.color,
                  }}
                />
              </div>

              {/* Estimate Subtitle */}
              <div className="vault-goal-subtext">
                <span>{percent.toFixed(0)}% complete</span>
                {g.estimate && <span>· {g.estimate}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
