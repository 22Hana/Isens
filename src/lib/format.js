export function formatNumber(n) {
  const v = Number.isFinite(n) ? n : 0;
  return Math.round(v).toLocaleString();
}

export function formatWon(n) {
  return `${formatNumber(n)}원`;
}

export function sum(arr) {
  return (arr || []).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

export function computeStats(salesArr, revenueArr) {
  const total = Math.round(sum(salesArr));
  const totalRev = sum(revenueArr);
  const maxSale = salesArr && salesArr.length ? Math.max(...salesArr) : 0;
  const maxRev = revenueArr && revenueArr.length ? Math.max(...revenueArr) : 0;
  return { total, totalRev, maxSale, maxRev };
}
