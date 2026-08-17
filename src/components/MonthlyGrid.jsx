import { MONTH_LABELS, CURRENT_YEAR_LABEL } from "../config.js";
import { formatNumber } from "../lib/format.js";

export default function MonthlyGrid({ sales, revenue, fitToScreen }) {
  return (
    <div className="comparison-container">
      <div className="year-row">
        <div className="year-label-col">{CURRENT_YEAR_LABEL}</div>
        <div className={`months-scroll-wrapper ${fitToScreen ? "no-scroll" : ""}`}>
          <div className={`months-grid ${fitToScreen ? "fit-grid" : ""}`}>
            {MONTH_LABELS.map((label, i) => {
              const s = sales[i] || 0;
              const r = revenue[i] || 0;
              const noData = s === 0 && r === 0;
              return (
                <div
                  key={label}
                  className={`month-item ${fitToScreen ? "fit-item" : ""} ${
                    noData ? "no-data" : ""
                  }`}
                >
                  <span className="m-label">{label}</span>
                  <span className="m-sales">{formatNumber(s)}</span>
                  <span className="m-rev">{formatNumber(r)}원</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
