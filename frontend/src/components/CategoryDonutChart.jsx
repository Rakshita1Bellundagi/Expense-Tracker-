import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { formatINR, filterTransactionsByTimeframe } from '../utils/helpers';

// Slices matching Vault palette
const DONUT_COLORS = [
  '#00c2ff', // Electric Cyan (Housing / Hostel)
  '#00e599', // Bright Mint (Food & Mess)
  '#a855f7', // Electric Purple (Transport / Education)
  '#fbbf24', // Warm Gold (Entertainment / Shopping)
  '#ff4d6d', // Rose Pink (Others)
  '#38bdf8', // Sky Blue
  '#f43f5e', // Rose
];

function CustomVaultDonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0];

  return (
    <div className="vault-donut-tooltip">
      <div className="flex items-center gap-xs mb-xs">
        <span className="legend-square" style={{ background: data.payload.fill }} />
        <strong style={{ color: '#fff', fontSize: 13 }}>{data.name}</strong>
      </div>
      <p style={{ color: '#8f96a3', fontSize: 12 }}>
        Amount: <strong style={{ color: '#fff' }}>{formatINR(data.value)}</strong>
      </p>
      <p style={{ color: '#5b6271', fontSize: 11, marginTop: 2 }}>
        Share: <strong>{(data.percent * 100).toFixed(0)}%</strong> of spent
      </p>
    </div>
  );
}

export default function CategoryDonutChart({ timeframe = null }) {
  const { summary, transactions } = useApp();

  const { data, totalSpent, subtitle } = useMemo(() => {
    let list = transactions;
    let label = 'All-Time Activity';

    if (timeframe) {
      list = filterTransactionsByTimeframe(transactions, timeframe);
      const labels = {
        '1W': 'Past 7 Days',
        '1M': 'Past 30 Days',
        '3M': 'Past 3 Months',
        '1Y': 'Past Year',
      };
      label = labels[timeframe] || timeframe;
    }

    const map = {};
    let sum = 0;
    for (const t of list) {
      if (t.type === 'expense') {
        const amt = parseFloat(t.amount) || 0;
        map[t.category] = (map[t.category] || 0) + amt;
        sum += amt;
      }
    }

    const slices = Object.entries(map)
      .map(([cat, val], idx) => ({
        name: cat,
        value: val,
        color: DONUT_COLORS[idx % DONUT_COLORS.length],
        percent: sum > 0 ? val / sum : 0,
      }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      data: slices,
      totalSpent: sum,
      subtitle: `By category • ${label}`,
    };
  }, [summary, transactions, timeframe]);

  const topCategories = data.slice(0, 4);

  return (
    <div className="vault-spending-donut-card" aria-label="Spending by category">
      <div className="vault-card-header">
        <h3 className="vault-card-title">Spending</h3>
        <p className="vault-card-subtitle">{subtitle}</p>
      </div>

      {/* Donut graphic */}
      <div className="vault-donut-wrapper">
        <ResponsiveContainer width="100%" height={160}>
          {data.length > 0 ? (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2.5}
                stroke="transparent"
              >
                {data.map((entry, index) => (
                  <Cell key={`donut-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomVaultDonutTooltip />} />
            </PieChart>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8f96a3', fontSize: 12 }}>
              No expenses in this period
            </div>
          )}
        </ResponsiveContainer>

        {/* Center Cutout Label */}
        <div className="vault-donut-center">
          <span className="donut-center-amount">{formatINR(totalSpent)}</span>
          <span className="donut-center-sub">spent</span>
        </div>
      </div>

      {/* Category List Rows with Square Dots */}
      <div className="vault-donut-list">
        {topCategories.length > 0 ? (
          topCategories.map((cat) => (
            <div key={cat.name} className="vault-donut-list-row flex-between">
              <div className="flex items-center gap-xs">
                <span className="legend-square" style={{ background: cat.color }} />
                <span className="donut-list-name" title={cat.name}>
                  {cat.name}
                </span>
              </div>
              <div className="donut-list-stat">
                <span className="donut-list-pct">{(cat.percent * 100).toFixed(0)}%</span>
                <span className="donut-list-div">-</span>
                <span className="donut-list-val">{formatINR(cat.value)}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0', color: '#8f96a3', fontSize: 12 }}>
            No category expenses recorded
          </div>
        )}
      </div>
    </div>
  );
}
