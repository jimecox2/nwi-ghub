"use client";

// Pie chart of resCalcs aggregated by a field (cost by default). Lean rebuild of
// the never-staged ResourceCostUsagePie using recharts.
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PALETTE, aggregateByField, formatCurrency, formatHours } from "./chartUtils";

export default function ResourceCostUsagePie({ data, fieldName, fieldLabel, metric = "cost" }) {
  const entries = aggregateByField(data, fieldName, { metric, topN: 10 });
  const fmt = metric === "cost" ? formatCurrency : formatHours;
  const total = entries.reduce((s, e) => s + e[metric], 0);

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{fieldLabel} — {metric === "cost" ? "Cost" : "Hours"}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 || total === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No data.</p>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={entries} dataKey={metric} nameKey="name" cx="50%" cy="50%" outerRadius={90} label={false}>
                  {entries.map((e, i) => (
                    <Cell key={e.name} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => fmt(value)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
