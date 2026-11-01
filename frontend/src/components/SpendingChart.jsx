import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatINR, filterTransactionsByTimeframe } from '../utils/helpers';

const COLOR_INCOME  = '#00e599'; // Mint Green
const COLOR_EXPENSE = '#ff4d6d'; // Coral Pink

function CustomCashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const income = payload.find((p) => p.dataKey === 'income')?.value || 0;
  const expense = payload.find((p) => p.dataKey === 'expense')?.value || 0;
  const net = income - expense;

  return (
    <div className="vault-chart-tooltip">
      <span className="vault-tooltip-month">{label}</span>
      <div className="vault-tooltip-row">
        <span className="vault-tooltip-dot" style={{ background: COLOR_INCOME }} />
        <span className="vault-tooltip-label">Income:</span>
        <strong style={{ color: COLOR_INCOME }}>{formatINR(income)}</strong>
      </div>
      <div className="vault-tooltip-row">
        <span className="vault-tooltip-dot" style={{ background: COLOR_EXPENSE }} />
        <span className="vault-tooltip-label">Spent:</span>
        <strong style={{ color: COLOR_EXPENSE }}>{formatINR(expense)}</strong>
      </div>
      <div className="vault-tooltip-row" style={{ marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 4 }}>
        <span className="vault-tooltip-label">Net:</span>
        <strong style={{ color: net >= 0 ? COLOR_INCOME : COLOR_EXPENSE }}>
          {formatINR(net)}
        </strong>
      </div>
    </div>
  );
}

export default function SpendingChart({ timeframe = '3M' }) {
  const { summary, transactions } = useApp();

  const { chartData, subtitle } = useMemo(() => {
    const now = new Date();
    let refTime = now.getTime();
    for (const t of transactions) {
      if (t.transaction_date) {
        const tTime = new Date(t.transaction_date + 'T23:59:59').getTime();
        if (tTime > refTime) refTime = tTime;
      }
    }
    const refDate = new Date(refTime);

    // ── 1. 1W: 7 Individual Days ──
    if (timeframe === '1W') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(refDate);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
        days.push({ iso, label: dayLabel, income: 0, expense: 0 });
      }

      transactions.forEach((t) => {
        const target = days.find((d) => d.iso === t.transaction_date);
        if (target) {
          const amt = parseFloat(t.amount) || 0;
          if (t.type === 'income') target.income += amt;
          else if (t.type === 'expense') target.expense += amt;
        }
      });

      return {
        chartData: days.map((d) => ({
          month: d.label,
          income: Math.round(d.income),
          expense: Math.round(d.expense),
        })),
        subtitle: 'Daily cash flow — past 7 days',
      };
    }

    // ── 2. 1M: 5 Segments of 6 Days ──
    if (timeframe === '1M') {
      const segments = [
        { label: 'Days 1-6',   startOffset: 30, endOffset: 24, income: 0, expense: 0 },
        { label: 'Days 7-12',  startOffset: 24, endOffset: 18, income: 0, expense: 0 },
        { label: 'Days 13-18', startOffset: 18, endOffset: 12, income: 0, expense: 0 },
        { label: 'Days 19-24', startOffset: 12, endOffset: 6,  income: 0, expense: 0 },
        { label: 'Days 25-30', startOffset: 6,  endOffset: 0,  income: 0, expense: 0 },
      ];

      const filtered = filterTransactionsByTimeframe(transactions, '1M');
      filtered.forEach((t) => {
        if (!t.transaction_date) return;
        const tTime = new Date(t.transaction_date + 'T23:59:59').getTime();
        const diffDays = Math.max(0, Math.floor((refTime - tTime) / (1000 * 60 * 60 * 24)));
        const amt = parseFloat(t.amount) || 0;

        const seg = segments.find((s) => diffDays <= s.startOffset && diffDays >= s.endOffset) || segments[segments.length - 1];
        if (seg) {
          if (t.type === 'income') seg.income += amt;
          else if (t.type === 'expense') seg.expense += amt;
        }
      });

      return {
        chartData: segments.map((s) => ({
          month: s.label,
          income: Math.round(s.income),
          expense: Math.round(s.expense),
        })),
        subtitle: '6-day intervals — past 30 days',
      };
    }

    // ── 3. 3M: Past 3 Calendar Months ──
    if (timeframe === '3M') {
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${y}-${m}`;
        const label = d.toLocaleDateString('en-IN', { month: 'short' });
        months.push({ key, label, income: 0, expense: 0 });
      }

      const filtered = filterTransactionsByTimeframe(transactions, '3M');
      filtered.forEach((t) => {
        if (!t.transaction_date) return;
        const key = t.transaction_date.slice(0, 7);
        const target = months.find((m) => m.key === key);
        if (target) {
          const amt = parseFloat(t.amount) || 0;
          if (t.type === 'income') target.income += amt;
          else if (t.type === 'expense') target.expense += amt;
        }
      });

      return {
        chartData: months.map((m) => ({
          month: m.label,
          income: Math.round(m.income),
          expense: Math.round(m.expense),
        })),
        subtitle: 'Monthly cash flow — past 3 months',
      };
    }

    // ── 4. 1Y: Past 12 Months ──
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${y}-${m}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      months.push({ key, label, income: 0, expense: 0 });
    }

    const filtered = filterTransactionsByTimeframe(transactions, '1Y');
    filtered.forEach((t) => {
      if (!t.transaction_date) return;
      const key = t.transaction_date.slice(0, 7);
      const target = months.find((m) => m.key === key);
      if (target) {
        const amt = parseFloat(t.amount) || 0;
        if (t.type === 'income') target.income += amt;
        else if (t.type === 'expense') target.expense += amt;
      }
    });

    return {
      chartData: months.map((m) => ({
        month: m.label,
        income: Math.round(m.income),
        expense: Math.round(m.expense),
      })),
      subtitle: 'Monthly cash flow — past 12 months',
    };
  }, [transactions, timeframe]);

  return (
    <div className="vault-cashflow-container" aria-label="Cash Flow Overview">
      {/* Header */}
      <div className="vault-card-header flex-between">
        <div>
          <h3 className="vault-card-title">Cash Flow Overview</h3>
          <p className="vault-card-subtitle">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="vault-chart-legend">
          <div className="vault-legend-item">
            <span className="legend-dot" style={{ background: COLOR_INCOME }} />
            <span>Income</span>
          </div>
          <div className="vault-legend-item">
            <span className="legend-dot" style={{ background: COLOR_EXPENSE }} />
            <span>Spent</span>
          </div>
        </div>
      </div>

      {/* Curved Spline Area Chart */}
      <div style={{ width: '100%', height: 230, marginTop: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeVaultGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_INCOME} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLOR_INCOME} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseVaultGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_EXPENSE} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLOR_EXPENSE} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
              tick={{ fill: '#8f96a3', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, 'dataMax + 2000']} />
            <Tooltip content={<CustomCashFlowTooltip />} />

            <Area
              type="monotone"
              dataKey="expense"
              stroke={COLOR_EXPENSE}
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#expenseVaultGrad)"
              dot={{ r: 3, fill: COLOR_EXPENSE, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: COLOR_EXPENSE, stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke={COLOR_INCOME}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#incomeVaultGrad)"
              dot={{ r: 3.5, fill: COLOR_INCOME, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: COLOR_INCOME, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
