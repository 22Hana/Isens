import { useState } from "react";
import { BRAND_SHEETS } from "../config.js";

const ALL_TAB = "전체";
const CATEGORY_OPTIONS = ["all", "전용", "범용"];
const SORT_OPTIONS = ["판매량", "매출액"];

export default function Controls({
  selectedBrand,
  onSelectBrand,
  category,
  onSelectCategory,
  sortKey,
  onSelectSort,
}) {
  const [panelOpen, setPanelOpen] = useState(false);

  const triggerLabel = `${category === "all" ? "전체" : category} | ${sortKey} 순 ▼`;

  return (
    <div className="search-sub-controls-wrapper">
      <div className="search-sub-controls">
        <div className="brand-tabs">
          {[ALL_TAB, ...BRAND_SHEETS].map((b) => (
            <button
              key={b}
              className={`tab-btn ${selectedBrand === b ? "active" : ""}`}
              onClick={() => onSelectBrand(b)}
            >
              {b}
            </button>
          ))}
        </div>
        <button
          className={`sort-trigger-btn ${panelOpen ? "active" : ""}`}
          onClick={() => setPanelOpen((v) => !v)}
        >
          {triggerLabel}
        </button>
      </div>

      {panelOpen && (
        <div className="filter-sort-scroll-wrapper">
          <div className="filter-sort-group">
            <span className="group-label">분류</span>
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c}
                className={`scroll-btn ${category === c ? "active" : ""}`}
                onClick={() => onSelectCategory(c)}
              >
                {c === "all" ? "전체" : c}
              </button>
            ))}
            <span className="divider mobile-divider-hide" />
            <span className="group-label">정렬</span>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s}
                className={`scroll-btn ${sortKey === s ? "active" : ""}`}
                onClick={() => onSelectSort(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { ALL_TAB };
