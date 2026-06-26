"use client";

// Horizontal bar chart of resCalcs aggregated by a field (hours). Lean rebuild
// of the never-staged ResourceUsageChart using recharts.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aggregateByField, formatHours, formatCurrency } from "./chartUtils";

export default function ResourceUsageChart({ data, fieldName, fieldLabel }) {
  const entries = aggregateByField(data, fieldName, { metric: "hours", topN: 15 });
  const height = Math.max(220, entries.length * 34);

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{fieldLabel} — Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={entries} layout="vertical" margin={{ left: 10, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={formatHours} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
              <Tooltip
                formatter={(value, name) => (name === "cost" ? formatCurrency(value) : `${formatHours(value)} h`)}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="hours" fill="#2b8fd9" name="Hours" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
