"use client";

// Capacity vs Demand — weekly resource demand computed from tbrescalcs2.
import { Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ReportShell from "@/components/dashboard/ReportShell";
import { resourceGuard } from "@/components/dashboard/charts/ResourceNotice";
import { num, formatHours, formatCurrency } from "@/components/dashboard/charts/chartUtils";

function CapacityBody({ resCalcs }) {
  const totalHours = resCalcs.reduce((s, r) => s + num(r.tbResCalcHours), 0);
  const totalCost = resCalcs.reduce((s, r) => s + num(r.tbResCalcCost), 0);
  const uniqueResources = new Set(resCalcs.map((r) => r.tbResCalcResID)).size;

  const weekMap = {};
  resCalcs.forEach((r) => {
    const wk = r.tbResCalcWeek || r.tbResCalcMonday || "Unknown";
    if (!weekMap[wk]) weekMap[wk] = { week: wk, demand: 0, resources: new Set() };
    weekMap[wk].demand += num(r.tbResCalcHours);
    weekMap[wk].resources.add(r.tbResCalcResID);
  });
  const weeklyData = Object.values(weekMap)
    .map((w) => ({ week: w.week, demand: Math.round(w.demand), resources: w.resources.size }))
    .sort((a, b) => new Date(a.week) - new Date(b.week));

  const roleMap = {};
  resCalcs.forEach((r) => {
    const role = r.tbMDPrimaryRole || "Unknown";
    roleMap[role] = (roleMap[role] || 0) + num(r.tbResCalcHours);
  });
  const roleData = Object.entries(roleMap)
    .map(([name, hours]) => ({ name, hours: Math.round(hours) }))
    .sort((a, b) => b.hours - a.hours);

  const resMap = {};
  resCalcs.forEach((r) => {
    const id = r.tbResCalcResID || "Unknown";
    if (!resMap[id]) resMap[id] = { id, name: r.tbMDNameShort || id, role: r.tbMDPrimaryRole || "—", hours: 0, cost: 0, weeks: new Set() };
    resMap[id].hours += num(r.tbResCalcHours);
    resMap[id].cost += num(r.tbResCalcCost);
    resMap[id].weeks.add(r.tbResCalcWeek || r.tbResCalcMonday);
  });
  const resources = Object.values(resMap)
    .map((r) => ({ ...r, hours: Math.round(r.hours), cost: Math.round(r.cost), weeks: r.weeks.size }))
    .sort((a, b) => b.hours - a.hours);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat value={uniqueResources} label="Resources" />
        <Stat value={weeklyData.length} label="Weeks" />
        <Stat value={`${formatHours(totalHours)}`} label="Total Demand (hrs)" />
        <Stat value={formatCurrency(totalCost)} label="Total Demand Cost" />
      </div>

      <Card className="border-gray-200">
        <CardContent className="pt-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Weekly Demand (hours)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={weeklyData} margin={{ top: 10, right: 30, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={formatHours} />
              <Tooltip formatter={(v) => `${formatHours(v)} h`} />
              <Bar dataKey="demand" fill="#2b8fd9" name="Demand (hrs)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="pt-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Demand by Role (hours)</h3>
          <ResponsiveContainer width="100%" height={Math.max(220, roleData.length * 34)}>
            <BarChart data={roleData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={formatHours} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
              <Tooltip formatter={(v) => `${formatHours(v)} h`} />
              <Bar dataKey="hours" fill="#0b4d8e" name="Hours" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="pt-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Resource Demand ({resources.length})</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Resource</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Weeks</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.slice(0, 200).map((r) => (
                  <TableRow key={r.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{r.name}</TableCell>
                    <TableCell className="text-gray-600">{r.role}</TableCell>
                    <TableCell className="text-gray-700">{r.weeks}</TableCell>
                    <TableCell className="text-gray-700">{formatHours(r.hours)}</TableCell>
                    <TableCell className="text-gray-700">{formatCurrency(r.cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const Stat = ({ value, label }) => (
  <Card className="border-gray-200">
    <CardContent className="py-3 text-center">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </CardContent>
  </Card>
);

export default function CapacityDemandPage() {
  return (
    <ReportShell title="Capacity vs Demand" icon={Gauge} subtitle="Weekly resource demand from preprocessed resource calculations.">
      {({ dashboardSource, adaptedData }) => {
        const guard = resourceGuard(dashboardSource, adaptedData);
        if (guard) return guard;
        return <CapacityBody resCalcs={adaptedData.resCalcs} />;
      }}
    </ReportShell>
  );
}
