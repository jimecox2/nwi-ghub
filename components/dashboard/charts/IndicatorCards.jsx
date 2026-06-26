"use client";

// Summary tiles for the cost charts. Lean rebuild of the never-staged
// IndicatorCards: groups the processed rows by category label and shows the
// total plus the top contributor for each.
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "./chartUtils";

export default function IndicatorCards({ currentRows = [] }) {
  const groups = {};
  for (const row of currentRows) {
    const label = row.label || row.fieldName;
    if (!groups[label]) groups[label] = { label, total: 0, top: null };
    groups[label].total += row.value || 0;
    if (!groups[label].top || (row.value || 0) > groups[label].top.value) {
      groups[label].top = { name: row.fieldValue, value: row.value || 0 };
    }
  }

  const cards = Object.values(groups);
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((g) => (
        <Card key={g.label} className="border-gray-200">
          <CardContent className="py-3">
            <p className="text-xs font-medium text-gray-500">{g.label}</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(g.total)}</p>
            {g.top && (
              <p className="mt-1 truncate text-xs text-gray-500" title={`${g.top.name}: ${formatCurrency(g.top.value)}`}>
                Top: {g.top.name || "—"}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
