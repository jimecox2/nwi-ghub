"use client";

// Executive Portfolio Summary. Ported from the legacy page: 7-dimension health
// classification (On Track / At Risk / Critical) per Portfolio/Project, summary
// counts, and a health-dot table. Uses the cookie-auth hook.
import { useMemo, useState } from "react";
import { Briefcase, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from "@/components/dashboard/EnterprisePageStates";
import { useEnterpriseDashboardSource } from "@/hooks/useEnterpriseDashboardSource";

const HEALTH_LABELS = [
  { key: "tbMDHealthOverall", label: "Overall" },
  { key: "tbMDHealthSchedule", label: "Schedule" },
  { key: "tbMDHealthCost", label: "Cost" },
  { key: "tbMDHealthHours", label: "Hours" },
  { key: "tbMDHealthScope", label: "Scope" },
  { key: "tbMDHealthRisk", label: "Risk" },
  { key: "tbMDHealthIssues", label: "Issues" },
];

const healthColor = (value) => {
  if (!value || value === "N/A") return "bg-gray-300";
  if (value === "Not Assessed") return "bg-orange-400";
  const v = value.toLowerCase();
  if (v === "green") return "bg-green-500";
  if (v === "amber" || v === "yellow" || v === "orange") return "bg-amber-500";
  if (v === "red") return "bg-red-500";
  return "bg-gray-300";
};

const healthScore = (value) => {
  if (!value || value === "N/A" || value === "Not Assessed") return 0;
  const v = value.toLowerCase();
  if (v === "green") return 1;
  if (v === "amber" || v === "yellow" || v === "orange") return 2;
  if (v === "red") return 3;
  return 0;
};

function classify(project, riskCount, issueCount) {
  const scores = HEALTH_LABELS.map((h) => healthScore(project[h.key])).filter((s) => s > 0);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const costVar = parseFloat(project.blCostVariance) || 0;
  const redCount = HEALTH_LABELS.filter((h) => (project[h.key] || "").toLowerCase() === "red").length;

  if (redCount >= 2 || costVar > 20 || avg >= 2.5) {
    return { label: "Critical", color: "text-red-700", bg: "bg-red-50", border: "border-red-300", Icon: XCircle, order: 0 };
  }
  if (redCount >= 1 || avg >= 1.5 || costVar > 10 || riskCount > 3 || issueCount > 5) {
    return { label: "At Risk", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300", Icon: AlertTriangle, order: 1 };
  }
  return { label: "On Track", color: "text-green-700", bg: "bg-green-50", border: "border-green-300", Icon: CheckCircle, order: 2 };
}

export default function ExecutiveSummaryPage() {
  const { dashboardSource, status, isLoading, error } = useEnterpriseDashboardSource({ autoPreprocess: false });
  const [sortBy, setSortBy] = useState("status");

  const cards = useMemo(() => {
    if (!dashboardSource) return [];
    const all = dashboardSource.tbmdjoined || [];
    const risksByProject = {};
    const issuesByProject = {};
    all.forEach((row) => {
      const proj = row.tbL2 || row.tbL1 || "Unknown";
      if (row.tbSubType === "Risk") risksByProject[proj] = (risksByProject[proj] || 0) + 1;
      if (row.tbSubType === "Issue") issuesByProject[proj] = (issuesByProject[proj] || 0) + 1;
    });

    const projects = all.filter((r) => r.tbType === "Portfolio" || r.tbType === "Project");
    return projects.map((project) => {
      const name = project.tbL2 || project.tbL1 || project.tbName || "Unknown";
      const riskCount = risksByProject[name] || 0;
      const issueCount = issuesByProject[name] || 0;
      return { ...project, riskCount, issueCount, classification: classify(project, riskCount, issueCount) };
    });
  }, [dashboardSource]);

  const sorted = useMemo(() => {
    const arr = [...cards];
    arr.sort((a, b) => {
      if (sortBy === "status") return a.classification.order - b.classification.order;
      if (sortBy === "name") return (a.tbName || "").localeCompare(b.tbName || "");
      if (sortBy === "cost") return (parseFloat(b.tbCost) || 0) - (parseFloat(a.tbCost) || 0);
      return 0;
    });
    return arr;
  }, [cards, sortBy]);

  if (isLoading) return <EnterpriseLoading title="Executive Portfolio Summary" icon={Briefcase} message="Loading portfolio data..." />;
  if (status === "unauthenticated") return <EnterpriseUnauthenticated reportName="the executive summary" />;
  if (error) return <EnterpriseError title="Executive Portfolio Summary" icon={Briefcase} error={error} />;
  if (!dashboardSource) return <EnterpriseNoSource title="Executive Portfolio Summary" icon={Briefcase} />;

  const counts = {
    Critical: cards.filter((c) => c.classification.label === "Critical").length,
    "At Risk": cards.filter((c) => c.classification.label === "At Risk").length,
    "On Track": cards.filter((c) => c.classification.label === "On Track").length,
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
          <Briefcase className="h-8 w-8 text-blue-800" />
          Executive Portfolio Summary
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Portfolio health overview for executive decision making — assess which projects to continue, watch, or terminate.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard value={cards.length} label="Total Projects" valueClass="text-gray-900" />
        <SummaryCard value={counts.Critical} label="Critical" valueClass="text-red-600" />
        <SummaryCard value={counts["At Risk"]} label="At Risk" valueClass="text-amber-600" />
        <SummaryCard value={counts["On Track"]} label="On Track" valueClass="text-green-600" />
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="text-gray-600">Sort by:</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded border border-gray-300 px-2 py-1">
          <option value="status">Status</option>
          <option value="name">Name</option>
          <option value="cost">Cost</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Risks</TableHead>
              <TableHead>Issues</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((p, i) => {
              const C = p.classification;
              return (
                <TableRow key={p.tbID ?? p.id ?? i} className="hover:bg-gray-50">
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${C.bg} ${C.border} ${C.color}`}>
                      <C.Icon className="h-3 w-3" />
                      {C.label}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{p.tbName}</TableCell>
                  <TableCell className="text-gray-600">{p.tbType}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" title={HEALTH_LABELS.map((h) => `${h.label}: ${p[h.key] || "N/A"}`).join("  ")}>
                      {HEALTH_LABELS.map((h) => (
                        <span key={h.key} className={`h-3 w-3 rounded-full ${healthColor(p[h.key])}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-700">${(parseFloat(p.tbCost) || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-gray-700">{p.riskCount}</TableCell>
                  <TableCell className="text-gray-700">{p.issueCount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SummaryCard({ value, label, valueClass }) {
  return (
    <Card className="border-gray-200">
      <CardContent className="py-4 text-center">
        <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}
