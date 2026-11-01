import React, { useMemo } from 'react';
import { formatINR, filterTransactionsByTimeframe, calculateTransactionStats } from '../utils/helpers';
import { useApp } from '../context/AppContext';

export default function SummaryCards({ timeframe = null }) {
  const { summary, summaryLoading, transactions } = useApp();

  const stats = useMemo(() => {
    // If no timeframe is provided, use the global server summary
    if (!timeframe) {
      const netSavings = summary ? parseFloat(summary.netSavings || '0') : 0;
      const totalIncome = summary ? parseFloat(summary.totalIncome || '0') : 0;
      const totalExpenses = summary ? parseFloat(summary.totalExpenses || '0') : 0;
      const savingsRate = summary?.savingsRate ? parseFloat(summary.savingsRate) : 0;

      return {
        netSavings,
        totalIncome,
        totalExpenses,
        savingsRate,
        periodLabel: 'ALL-TIME',
        subtext: 'vs previous quarter',
        count: transactions.length,
      };
    }

    // Filter transactions by the selected timeframe (1W, 1M, 3M, 1Y)
    const filtered = filterTransactionsByTimeframe(transactions, timeframe);
    const computed = calculateTransactionStats(filtered);

    const timeframeLabels = {
      '1W': { periodLabel: 'PAST 7 DAYS', subtext: 'past week' },
      '1M': { periodLabel: 'THIS MONTH', subtext: 'past 30 days' },
      '3M': { periodLabel: 'PAST 3 MONTHS', subtext: 'past quarter' },
      '1Y': { periodLabel: 'PAST YEAR', subtext: 'annual total' },
    };

    const meta = timeframeLabels[timeframe] || { periodLabel: timeframe, subtext: 'selected window' };

    return {
      netSavings: computed.netSavings,
      totalIncome: computed.income,
      totalExpenses: computed.expense,
      savingsRate: computed.savingsRate,
      periodLabel: meta.periodLabel,
      subtext: meta.subtext,
      count: computed.count,
    };
  }, [summary, transactions, timeframe]);

  return (
    <div className="vault-summary-grid" role="region" aria-label="Financial summary cards">
      {/* 1. HERO CARD: Net Savings */}
      <div className="vault-stat-card vault-stat-card--hero">
        <span className="vault-card-label">
          {timeframe ? `NET SAVINGS (${stats.periodLabel})` : 'NET WORTH'}
        </span>
        <div className="vault-card-value">
          {summaryLoading ? '…' : formatINR(stats.netSavings)}
        </div>
        <div className="vault-card-trend">
          <span className="trend-arrow">↑</span>
          <span>
            {stats.count} transaction{stats.count !== 1 ? 's' : ''} ({stats.subtext})
          </span>
        </div>
      </div>

      {/* 2. Total Income */}
      <div className="vault-stat-card">
        <span className="vault-card-label">
          {timeframe ? `INCOME (${stats.periodLabel})` : 'TOTAL INCOME'}
        </span>
        <div className="vault-card-value">
          {summaryLoading ? '…' : formatINR(stats.totalIncome)}
        </div>
        <div className="vault-card-trend trend-positive">
          <span className="trend-arrow">↑</span>
          <span>Earned in {stats.subtext}</span>
        </div>
      </div>

      {/* 3. Total Spent */}
      <div className="vault-stat-card">
        <span className="vault-card-label">
          {timeframe ? `TOTAL SPENT (${stats.periodLabel})` : 'TOTAL SPENT'}
        </span>
        <div className="vault-card-value" style={{ color: stats.totalExpenses > 0 ? '#ff4d6d' : 'inherit' }}>
          {summaryLoading ? '…' : formatINR(stats.totalExpenses)}
        </div>
        <div className="vault-card-trend trend-negative">
          <span className="trend-arrow">↓</span>
          <span>Debited in {stats.subtext}</span>
        </div>
      </div>

      {/* 4. Savings Rate */}
      <div className="vault-stat-card">
        <span className="vault-card-label">
          {timeframe ? `SAVINGS RATE (${stats.periodLabel})` : 'SAVINGS RATE'}
        </span>
        <div className="vault-card-value">
          {summaryLoading ? '…' : `${stats.savingsRate.toFixed(0)}%`}
        </div>
        <div className="vault-card-trend trend-cyan">
          <span className="trend-arrow">↑</span>
          <span>Saved from income ({stats.subtext})</span>
        </div>
      </div>
    </div>
  );
}
