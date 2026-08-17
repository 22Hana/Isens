import { BRAND_COLORS } from "../config.js";
import { computeStats, formatNumber, formatWon } from "../lib/format.js";
import MonthlyGrid from "./MonthlyGrid.jsx";

export default function ItemCard({ item, brand }) {
  const { total, totalRev, maxSale, maxRev } = computeStats(item.sales, item.revenue);
  const brandClass = `brand-${brand}`;

  return (
    <div className={`result-card brand-result-card ${brandClass}`}>
      <div className="card-header-flex">
        <div>
          <span className="category-badge">{brand}</span>
        </div>
      </div>
      <div className="card-info-grid">
        <div className="info-box">
          <span className="label">품목코드</span>
          <span className="value">{item.itemCode || "-"}</span>
        </div>
        <div className="info-box">
          <span className="label">품목명</span>
          <span className="value">{item.itemName || "알수없음"}</span>
        </div>
      </div>

      <div className="stats-container-row">
        <div className="stats-group">
          <div className="stats-grid-inner">
            <div className="stats-box highlight">
              <span className="label">누적 판매량</span>
              <span className="value">{formatNumber(total)}</span>
            </div>
            <div className="stats-box highlight-rev">
              <span className="label">누적 매출액</span>
              <span className="value small">{formatWon(totalRev)}</span>
            </div>
            <div className="stats-box">
              <span className="label">월 최대 판매</span>
              <span className="value">{formatNumber(maxSale)}</span>
            </div>
            <div className="stats-box">
              <span className="label">월 최대 매출</span>
              <span className="value small">{formatWon(maxRev)}</span>
            </div>
          </div>
        </div>
      </div>

      <MonthlyGrid sales={item.sales} revenue={item.revenue} fitToScreen={false} />
    </div>
  );
}
