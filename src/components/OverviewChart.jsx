import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { MONTH_LABELS, CURRENT_YEAR_LABEL } from "../config.js";
import { formatNumber, formatWon, sum } from "../lib/format.js";

export default function OverviewChart({ overview }) {
  if (!overview) return null;
  const { revenue, margin, marginRate } = overview;

  const data = MONTH_LABELS.map((label, i) => ({
    month: label,
    매출액: Math.round(revenue[i] || 0),
    본사마진: Math.round(margin[i] || 0),
    마진율: revenue[i] > 0 ? Number(((margin[i] / revenue[i]) * 100).toFixed(1)) : 0,
  }));

  // 데이터가 존재하는 마지막 달(YTD 계산용)
  let lastIdx = -1;
  for (let i = 0; i < 12; i++) {
    if ((revenue[i] || 0) > 0 || (margin[i] || 0) !== 0) lastIdx = i;
  }

  const ytdRevenue = lastIdx >= 0 ? sum(revenue.slice(0, lastIdx + 1)) : 0;
  const ytdMargin = lastIdx >= 0 ? sum(margin.slice(0, lastIdx + 1)) : 0;
  const ytdMarginRate = ytdRevenue > 0 ? (ytdMargin / ytdRevenue) * 100 : 0;

  return (
    <div className="result-card overview-chart-card">
      <div className="card-header-flex">
        <h3 className="card-title">매출 및 본사마진 {CURRENT_YEAR_LABEL}년 추이</h3>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
            <Tooltip formatter={(v) => formatWon(v)} />
            <Legend />
            <Bar dataKey="매출액" fill="#1e40af" radius={[4, 4, 0, 0]} />
            <Line dataKey="본사마진" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-grid-inner" style={{ marginTop: 20 }}>
        <div className="stats-box highlight-rev">
          <span className="label">{CURRENT_YEAR_LABEL}년 누적 매출액</span>
          <span className="value small">{formatWon(ytdRevenue)}</span>
        </div>
        <div className="stats-box highlight">
          <span className="label">{CURRENT_YEAR_LABEL}년 누적 본사마진</span>
          <span className="value small">{formatWon(ytdMargin)}</span>
        </div>
        <div className="stats-box">
          <span className="label">{CURRENT_YEAR_LABEL}년 본사마진율 누적</span>
          <span className="value">{ytdMarginRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
