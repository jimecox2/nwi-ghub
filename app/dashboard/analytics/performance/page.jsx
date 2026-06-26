"use client";

// Performance Analytics — schedule & cost performance across the portfolio,
// computed from Portfolio/Project rows in the active source. New page (not in
// the legacy); built on the same ReportShell + recharts patterns.
import { TrendingUp } from "lucide-react";
import {
  ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import ReportShell from "@/components/dashboard/ReportShell";
import { num, formatHours, formatCurrency } from "@/components/dashboard/charts/chartUtils";

const pct = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`);
const shortName = (s) => (s && s.length > 18 ? s.slice(0, 16) + "…" : s || "—");

function buildRows(projects) {
  return projects.map((p) => {
    const work = num(p.tbWork);
    const baselineWork = num(p.tbBaselineWork);
    const cost = num(p.tbCost);
    const budget = num(p.tbBudget);
    return {
      name: p.tbName || "Unknown",
      type: p.tbType,
      status: p.tbMDStatus || "Unknown",
      work,
      baselineWork,
      cost,
      budget,
      percentComplete: num(p.tbPercentComplete),
      scheduleVar: baselineWork > 0 ? ((work - baselineWork) / baselineWork) * 100 : null,
      costVar: budget > 0 ? ((cost - budget) / budget) * 100 : null,
    };
  });
}

function Body({ dashboardSource }) {
  const projects = (dashboardSource.tbmdjoined || []).filter((r) => r.tbType === "Portfolio" || r.tbType === "Project");
  const rows = buildRows(projects);

  if (rows.length === 0) {
    return <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">No portfolio or project data in this source.</div>;
  }

  const avg = (vals) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null);
  const schedVals = rows.map((r) => r.scheduleVar).filter((v) => v != null);
  const costVals = rows.map((r) => r.costVar).filter((v) => v != null);
  const avgSched = avg(schedVals);
  const avgCost = avg(costVals);
  const avgComplete = avg(rows.map((r) => r.percentComplete).filter((v) => v > 0));
  const overBudget = rows.filter((r) => r.costVar != null && r.costVar > 0).length;

  // Scatter: schedule vs cost variance, bubble sized by cost.
  const scatter = rows
    .filter((r) => r.scheduleVar != null && r.costVar != null)
    .map((r) => ({ x: r.scheduleVar, y: r.costVar, z: Math.max(r.cost, 1), name: r.name }));

  // Work: baseline vs actual, top 15 by actual work.
  const workData = [...rows]
    .filter((r) => r.work > 0 || r.baselineWork > 0)
    .sort((a, b) => b.work - a.work)
    .slice(0, 15)
    .map((r) => ({ name: shortName(r.name), Baseline: Math.round(r.baselineWork), Actual: Math.round(r.work) }));

  // Status distribution.
  const statusCounts = {};
  rows.forEach((r) => (statusCounts[r.status] = (statusCounts[r.status] || 0) + 1));
  const statusData = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi value={rows.length} label="Projects" />
        <Kpi value={pct(avgSched)} label="Avg Schedule Variance" cls={avgSched > 0 ? "text-red-600" : "text-green-600"} />
        <Kpi value={pct(avgCost)} label="Avg Cost Variance" cls={avgCost > 0 ? "text-red-600" : "text-green-600"} />
        <Kpi value={avgComplete == null ? "—" : `${avgComplete.toFixed(0)}%`} label="Avg % Complete" />
      </div>

      <Panel title="Schedule vs Cost Variance" subtitle={`Each bubble is a project (size = cost). Top-right = over schedule and over budget. ${overBudget} project(s) over budget.`}>
        {scatter.length === 0 ? (
          <Empty>No projects have both baseline work and budget set, so variance can't be computed.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="x" name="Schedule Var" unit="%" tick={{ fontSize: 11 }}
                label={{ value: "Schedule Variance %", position: "insideBottom", offset: -15, fontSize: 12 }} />
              <YAxis type="number" dataKey="y" name="Cost Var" unit="%" tick={{ fontSize: 11 }}
                label={{ value: "Cost Variance %", angle: -90, position: "insideLeft", fontSize: 12 }} />
              <ZAxis type="number" dataKey="z" range={[60, 600]} name="Cost" />
              <ReferenceLine x={0} stroke="#9ca3af" />
              <ReferenceLine y={0} stroke="#9ca3af" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name) => (name === "Cost" ? formatCurrency(value) : `${Number(value).toFixed(1)}%`)}
                labelFormatter={() => ""}
                content={({ payload }) =>
                  payload && payload.length ? (
                    <div className="rounded border border-gray-200 bg-white p-2 text-xs shadow">
                      <p className="font-medium">{payload[0].payload.name}</p>
                      <p>Schedule: {payload[0].payload.x.toFixed(1)}%</p>
                      <p>Cost: {payload[0].payload.y.toFixed(1)}%</p>
                      <p>Cost: {formatCurrency(payload[0].payload.z)}</p>
                    </div>
                  ) : null
                }
              />
              <Scatter data={scatter} fill="#2b8fd9" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Planned vs Actual Work" subtitle="Baseline work hours vs actual work hours (top 15 by actual).">
        <ResponsiveContainer width="100%" height={Math.max(260, workData.length * 32)}>
          <BarChart data={workData} layout="vertical" margin={{ left: 10, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={formatHours} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
            <Tooltip formatter={(v) => `${formatHours(v)} h`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Baseline" fill="#94a3b8" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Actual" fill="#2b8fd9" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Status Distribution">
        <ResponsiveContainer width="100%" height={Math.max(200, statusData.length * 36)}>
          <BarChart data={statusData} layout="vertical" margin={{ left: 10, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
            <Tooltip />
            <Bar dataKey="count" fill="#0b4d8e" name="Projects" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
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

export default function PerformanceAnalyticsPage() {
  return (
    <ReportShell title="Performance Analytics" icon={TrendingUp} subtitle="Schedule and cost performance across the portfolio.">
      {({ dashboardSource }) => <Body dashboardSource={dashboardSource} />}
    </ReportShell>
  );
}
