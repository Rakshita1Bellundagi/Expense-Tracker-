import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Sparkles,
  Calendar,
} from 'lucide-react';
import SpendingChart from '../components/SpendingChart';
import CategoryDonutChart from '../components/CategoryDonutChart';
import BudgetTracker from '../components/BudgetTracker';
import SavingsGoalAndInsights from '../components/SavingsGoalAndInsights';
import SummaryCards from '../components/SummaryCards';
import { useApp } from '../context/AppContext';

export default function Analytics() {
  const { summary, loading } = useApp();
  const [timeframe, setTimeframe] = useState('3M');

  return (
    <main className="page" id="analytics-page">
      {/* ── Page Header ── */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Financial Analytics & Insights</h1>
          <p className="page-subtitle">
            Visual breakdown of cash inflows, spending distribution, and budget goals
          </p>
        </div>

        {/* Timeframe pill selector */}
        <div className="vault-timeframe-pills" role="group" aria-label="Timeframe selector">
          {['1W', '1M', '3M', '1Y'].map((tf) => (
            <button
              key={tf}
              type="button"
              className={`vault-timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Summary Cards ── */}
      <div style={{ marginBottom: 28 }}>
        <SummaryCards timeframe={timeframe} />
      </div>

      {/* ── Main Charts Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 24,
          marginBottom: 28,
        }}
      >
        <SpendingChart timeframe={timeframe} />
        <CategoryDonutChart timeframe={timeframe} />
      </div>

      {/* ── Budget & Savings Goals ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 24,
        }}
      >
        <BudgetTracker />
        <SavingsGoalAndInsights />
      </div>
    </main>
  );
}

