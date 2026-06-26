"use client";

// Cost Analytics — portfolio cost vs budget, top costs, and (when preprocessed)
// a weekly cost trend from resource calculations. New page (not in the legacy);
// built on the same ReportShell + recharts patterns.
import { DollarSign } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ReportShell from "@/components/dashboard/ReportShell";
import { num, formatCurrency } from "@/components/dashboard/charts/chartUtils";

const shortName = (s) => (s && s.length > 18 ? s.slice(0, 16) + "…" : s || "—");
const pct = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`);

function Body({ dashboardSource, adaptedData }) {
  const projects = (dashboardSource.tbmdjoined || []).filter((r) => r.tbType === "Portfolio" || r.tbType === "Project");
  const rows = projects.map((p) => ({
    name: p.tbName || "Unknown",
    type: p.tbType,
    cost: num(p.tbCost),
    budget: num(p.tbBudget),
    status: p.tbMDStatus || "—",
  }));

  if (rows.length === 0) {
    return <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">No portfolio or project data in this source.</div>;
  }

  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const variance = totalBudget > 0 ? ((totalCost - totalBudget) / totalBudget) * 100 : null;
  const overBudget = rows.filter((r) => r.budget > 0 && r.cost > r.budget).length;

  const byCost = [...rows].filter((r) => r.cost > 0).sort((a, b) => b.cost - a.cost);
  const costBar = byCost.slice(0, 15).map((r) => ({ name: shortName(r.name), Cost: Math.round(r.cost) }));
  const budgetBar = byCost
    .filter((r) => r.budget > 0)
    .slice(0, 15)
    .map((r) => ({ name: shortName(r.name), Budget: Math.round(r.budget), Actual: Math.round(r.cost) }));

  // Weekly cost trend from resCalcs (available after preprocessing).
  const resCalcs = adaptedData?.resCalcs || [];
  const weekMap = {};
  resCalcs.forEach((r) => {
    const wk = r.tbResCalcWeek || r.tbResCalcMonday || "Unknown";
    weekMap[wk] = (weekMap[wk] || 0) + num(r.tbResCalcCost);
  });
  const trend = Object.entries(weekMap)
    .map(([week, cost]) => ({ week, cost: Math.round(cost) }))
    .sort((a, b) => new Date(a.week) - new Date(b.week));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi value={formatCurrency(totalCost)} label="Total Cost" />
        <Kpi value={formatCurrency(totalBudget)} label="Total Budget" />
        <Kpi value={pct(variance)} label="Cost vs Budget" cls={variance > 0 ? "text-red-600" : "text-green-600"} />
        <Kpi value={overBudget} label="Projects Over Budget" cls={overBudget > 0 ? "text-red-600" : "text-green-600"} />
      </div>

      <Panel title="Cost by Project" subtitle="Top 15 projects by cost.">
        <ResponsiveContainer width="100%" height={Math.max(260, costBar.length * 32)}>
          <BarChart data={costBar} layout="vertical" margin={{ left: 10, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={formatCurrency} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar dataKey="Cost" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Budget vs Actual" subtitle="Projects with a budget set (top 15 by cost).">
        {budgetBar.length === 0 ? (
          <Empty>No projects have a budget (tbBudget) set.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(260, budgetBar.length * 34)}>
            <BarChart data={budgetBar} layout="vertical" margin={{ left: 10, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Budget" fill="#94a3b8" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Actual" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      {trend.length > 1 && (
        <Panel title="Weekly Cost Trend" subtitle="Resource cost over time (from preprocessed resource calculations).">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trend} margin={{ top: 10, right: 30, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={formatCurrency} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="cost" stroke="#0b4d8e" strokeWidth={2} dot={{ r: 2 }} name="Cost" />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      )}

      <Panel title={`Project Costs (${byCost.length})`}>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCost.slice(0, 200).map((r, i) => {
                const v = r.budget > 0 ? ((r.cost - r.budget) / r.budget) * 100 : null;
                return (
                  <TableRow key={i} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{r.name}</TableCell>
                    <TableCell className="text-gray-600">{r.type}</TableCell>
                    <TableCell className="text-gray-600">{r.status}</TableCell>
                    <TableCell className="text-gray-700">{r.budget > 0 ? formatCurrency(r.budget) : "—"}</TableCell>
                    <TableCell className="text-gray-700">{formatCurrency(r.cost)}</TableCell>
                    <TableCell className={v == null ? "text-gray-400" : v > 0 ? "text-red-600" : "text-green-600"}>{pct(v)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  );
}

const Kpi = ({ value, label, cls = "text-gray-900" }) => (
  <Card className="border-gray-200">
    <CardContent className="py-3 text-center">
      <p className={`text-2xl font-bold ${cls}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </CardContent>
  </Card>
);

const Panel = ({ title, subtitle, children }) => (
  <Card className="border-gray-200">
    <CardContent className="pt-4">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      {subtitle && <p className="mb-3 text-xs text-gray-500">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </CardContent>
  </Card>
);

const Empty = ({ children }) => <p className="py-8 text-center text-sm text-gray-500">{children}</p>;

export default function CostAnalyticsPage() {
  return (
    <ReportShell title="Cost Analytics" icon={DollarSign} subtitle="Portfolio cost vs budget and cost trends.">
      {({ dashboardSource, adaptedData }) => <Body dashboardSource={dashboardSource} adaptedData={adaptedData} />}
    </ReportShell>
  );
}
