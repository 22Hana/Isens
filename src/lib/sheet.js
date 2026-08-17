// ===================================================================
// 구글 스프레드시트 gviz(공개 조회) API 연동 유틸리티
// - 인증/구글 로그인 없이, 공개 링크로 시트 데이터를 읽어옵니다.
// - 스프레드시트가 "링크가 있는 모든 사용자(뷰어)"로 공유되어 있어야 합니다.
// ===================================================================

import { SPREADSHEET_ID } from "../config.js";

/** 엑셀 스타일 열 문자를 0-based 인덱스로 변환 (A -> 0, B -> 1, ... Z -> 25, AA -> 26) */
export function colLetterToIndex(letter) {
  let n = 0;
  for (const ch of letter) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n - 1;
}

const CATEGORY_COL = colLetterToIndex("B"); // 1
const ITEM_CODE_COL = colLetterToIndex("I"); // 8
const ITEM_NAME_COL = colLetterToIndex("J"); // 9
const MONTH_START_COL = colLetterToIndex("Q"); // 16

/**
 * 구글 시트 한 탭(sheet)을 gviz JSON으로 가져와 2차원 배열(행 -> 셀값 배열)로 반환합니다.
 * @param {string} sheetName
 * @returns {Promise<Array<Array<any>>>}
 */
export async function fetchSheetRows(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    sheetName
  )}&t=${Date.now()}`;

  let res;
  try {
    res = await fetch(url, { mode: "cors" });
  } catch (e) {
    throw new Error("SHEET_ACCESS_ERROR");
  }
  if (!res.ok) {
    throw new Error("SHEET_ACCESS_ERROR");
  }
  const text = await res.text();
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if (!match) {
    throw new Error("SHEET_ACCESS_ERROR");
  }
  let json;
  try {
    json = JSON.parse(match[1]);
  } catch (e) {
    throw new Error("SHEET_ACCESS_ERROR");
  }
  if (json.status === "error") {
    throw new Error("SHEET_ACCESS_ERROR");
  }

  const rows = json.table.rows || [];
  return rows.map((row) => (row.c || []).map((cell) => (cell ? cell.v : null)));
}

function getCellString(row, colIdx) {
  const v = row[colIdx];
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function getCellNumber(row, colIdx) {
  const v = row[colIdx];
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 한 탭의 원시 행 배열(rows)을 파싱해서 품목별 데이터 + 합계(totals)를 만듭니다.
 * @param {Array<Array<any>>} rows
 * @param {{ hasMargin: boolean }} opts  hasMargin=true면 월별로 [판매수량, 매출액, 마진] 3열, false면 [판매수량, 매출액] 2열
 */
export function parseSheetRows(rows, { hasMargin }) {
  const step = hasMargin ? 3 : 2;

  const monthCols = Array.from({ length: 12 }, (_, i) => {
    const base = MONTH_START_COL + i * step;
    return { sales: base, revenue: base + 1, margin: hasMargin ? base + 2 : null };
  });

  const readMonthly = (row) => {
    const sales = new Array(12).fill(0);
    const revenue = new Array(12).fill(0);
    const margin = hasMargin ? new Array(12).fill(0) : null;
    monthCols.forEach((c, i) => {
      sales[i] = getCellNumber(row, c.sales);
      revenue[i] = getCellNumber(row, c.revenue);
      if (hasMargin) margin[i] = getCellNumber(row, c.margin);
    });
    return { sales, revenue, margin };
  };

  // 1) 합계(totals) 행 탐색
  // 주의: gviz는 시트 상단의 병합된 헤더(예: "N월" + "판매수량/매출액/마진")를
  // 자동으로 감지해서 실제 데이터에서 제외하기 때문에, 여기서 받는 행 번호는
  // 원본 스프레드시트의 행 번호와 다릅니다. 그래서 "합계"라는 글자 위치를
  // 직접 찾기보다, 구조적으로 판단합니다:
  //  - 품목코드가 없으면서 월별 수치(Q열~)가 채워진 행들은 "전용/범용/합계" 같은
  //    소계 행이고, 그 중 마지막 행이 전체 합계("합계") 행입니다.
  //  - 그 다음에는 헤더 텍스트 행(품목코드 없음, 월별 수치도 없음)이 나온 뒤
  //    실제 품목 행(품목코드 있음)이 시작됩니다.
  let totalsRowIdx = -1;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const hasItemCode = !!getCellString(row, ITEM_CODE_COL);
    if (hasItemCode) break; // 품목 행이 시작되면 탐색 종료
    const hasMonthlyData = row[MONTH_START_COL] !== null && row[MONTH_START_COL] !== undefined;
    if (hasMonthlyData) totalsRowIdx = r;
  }
  // 혹시 위 방식으로 못 찾으면 경험적으로 확인된 위치(0-based row 2)를 기본값으로 사용
  if (totalsRowIdx === -1) totalsRowIdx = 2;

  const totals = totalsRowIdx >= 0 && rows[totalsRowIdx] ? readMonthly(rows[totalsRowIdx]) : {
    sales: new Array(12).fill(0),
    revenue: new Array(12).fill(0),
    margin: hasMargin ? new Array(12).fill(0) : null,
  };

  // 2) 품목 행 파싱: 합계 행 이후, itemCode가 존재하는 행만
  const items = [];
  for (let r = totalsRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;
    const itemCode = getCellString(row, ITEM_CODE_COL);
    const itemName = getCellString(row, ITEM_NAME_COL);
    if (!itemCode && !itemName) continue; // 빈 줄(스페이서) 건너뛰기

    const category = getCellString(row, CATEGORY_COL);
    const { sales, revenue, margin } = readMonthly(row);
    items.push({ category, itemCode, itemName, sales, revenue, margin });
  }

  return { items, totals };
}

/**
 * 브랜드 탭(마진 컬럼 있음) 하나를 가져와서 파싱합니다.
 */
export async function fetchBrandSheet(sheetName) {
  const rows = await fetchSheetRows(sheetName);
  return parseSheetRows(rows, { hasMargin: true });
}

/**
 * 통합 품목 탭(마진 컬럼 없음)을 가져와서 파싱합니다.
 */
export async function fetchCombinedSheet(sheetName) {
  const rows = await fetchSheetRows(sheetName);
  return parseSheetRows(rows, { hasMargin: false });
}
