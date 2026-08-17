import { useCallback, useEffect, useState } from "react";
import { BRAND_SHEETS, COMBINED_SHEET } from "../config.js";
import { fetchBrandSheet, fetchCombinedSheet } from "./sheet.js";
import { sum } from "./format.js";

function buildGroupedItems(brandData) {
  const map = new Map();
  for (const brand of BRAND_SHEETS) {
    const { items } = brandData[brand] || { items: [] };
    for (const item of items) {
      const key = item.itemCode || `${brand}-${item.itemName}`;
      if (!map.has(key)) {
        map.set(key, {
          category: item.category,
          itemCode: item.itemCode,
          itemName: item.itemName,
          totalSummary: { sales: new Array(12).fill(0), revenue: new Array(12).fill(0) },
          brandResults: [],
        });
      }
      const group = map.get(key);
      for (let i = 0; i < 12; i++) {
        group.totalSummary.sales[i] += item.sales[i] || 0;
        group.totalSummary.revenue[i] += item.revenue[i] || 0;
      }
      group.brandResults.push({
        ...item,
        brand,
        totalAnnual: sum(item.sales),
      });
    }
  }
  return Array.from(map.values());
}

function buildOverview(brandData, combinedData) {
  const revenue = combinedData ? combinedData.totals.revenue.slice(0, 12) : new Array(12).fill(0);
  const margin = new Array(12).fill(0);
  const buy = new Array(12).fill(0); // 이 스프레드시트는 매입 데이터를 별도 제공하지 않음(마진은 이미 계산됨)
  for (const brand of BRAND_SHEETS) {
    const totals = brandData[brand]?.totals;
    if (!totals || !totals.margin) continue;
    for (let i = 0; i < 12; i++) {
      margin[i] += totals.margin[i] || 0;
    }
  }
  const marginRate = revenue.map((r, i) => (r > 0 ? (margin[i] / r) * 100 : 0));
  return { revenue, margin, marginRate, buy };
}

export function useSheetData() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    brandData: {},
    combinedData: null,
    groupedItems: [],
    overview: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const brandResults = await Promise.all(
        BRAND_SHEETS.map((name) => fetchBrandSheet(name))
      );
      const combinedData = await fetchCombinedSheet(COMBINED_SHEET);

      const brandData = {};
      BRAND_SHEETS.forEach((name, i) => {
        brandData[name] = brandResults[i];
      });

      const groupedItems = buildGroupedItems(brandData);
      const overview = buildOverview(brandData, combinedData);

      setState({ loading: false, error: null, brandData, combinedData, groupedItems, overview });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error:
          e && e.message === "SHEET_ACCESS_ERROR"
            ? "구글 시트 접근 권한이 없습니다."
            : "데이터 로딩 중 오류가 발생했습니다.",
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
