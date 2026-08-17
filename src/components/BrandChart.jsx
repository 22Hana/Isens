import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { MONTH_LABELS, CURRENT_YEAR_LABEL, BRAND_COLORS } from "../config.js";
import { formatNumber, formatWon, sum } from "../lib/format.js";

export default function BrandChart({ brand, totals }) {
  if (!totals) return null;
  const revenue = totals.revenue.slice(0, 12);
  const color = BRAND_COLORS[brand] || "#1e40af";

  const data = MONTH_LABELS.map((label, i) => ({
    month: label,
    매출액: Math.round(revenue[i] || 0),
  }));

  let lastIdx = -1;
  for (let i = 0; i < 12; i++) {
    if ((revenue[i] || 0) > 0) lastIdx = i;
  }
  const ytdRevenue = lastIdx >= 0 ? sum(revenue.slice(0, lastIdx + 1)) : 0;

  return (
    <div className="result-card overview-chart-card">
      <div className="card-header-flex">
        <h3 className="card-title">{brand} 매출액 {CURRENT_YEAR_LABEL}년 추이</h3>
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
            <Tooltip formatter={(v) => formatWon(v)} />
            <Bar dataKey="매출액" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-grid-inner" style={{ marginTop: 20 }}>
        <div className="stats-box highlight-rev">
          <span className="label">{CURRENT_YEAR_LABEL}년 누적 매출액</span>
          <span className="value small">{formatWon(ytdRevenue)}</span>
        </div>
      </div>
    </div>
  );
}
