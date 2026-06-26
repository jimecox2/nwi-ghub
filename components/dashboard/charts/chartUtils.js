// Shared helpers for the resource chart components.

// Stable categorical palette for pies/bars.
export const PALETTE = [
  "#2b8fd9", "#0b4d8e", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6", "#6366f1",
];

export const num = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
};

export const formatHours = (h) => (Math.abs(h) >= 1000 ? `${(h / 1000).toFixed(1)}K` : `${Math.round(h)}`);

export const formatCurrency = (c) => {
  if (Math.abs(c) >= 1_000_000) return `$${(c / 1_000_000).toFixed(1)}M`;
  if (Math.abs(c) >= 1000) return `$${(c / 1000).toFixed(1)}K`;
  return `$${Math.round(c)}`;
};

// Aggregate resCalcs rows by a field, summing hours + cost. Returns entries
// sorted by the chosen metric desc, collapsing the long tail into "Other".
export function aggregateByField(data, fieldName, { metric = "cost", topN = 10 } = {}) {
  const totals = {};
  for (const row of data || []) {
    const key = row[fieldName] || "Unknown";
    if (!totals[key]) totals[key] = { name: String(key), hours: 0, cost: 0 };
    totals[key].hours += num(row.tbResCalcHours);
    totals[key].cost += num(row.tbResCalcCost);
  }
  const entries = Object.values(totals).sort((a, b) => b[metric] - a[metric]);
  if (entries.length <= topN) return entries;
  const head = entries.slice(0, topN);
  const tail = entries.slice(topN);
  const other = tail.reduce(
    (acc, e) => ({ name: "Other", hours: acc.hours + e.hours, cost: acc.cost + e.cost }),
    { name: "Other", hours: 0, cost: 0 }
  );
  return [...head, other];
}
