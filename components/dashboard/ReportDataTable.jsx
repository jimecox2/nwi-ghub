"use client";

// Configurable report table — the lean replacement for the never-staged
// ItemDetailsDataTable. Column presets keyed by reportType (default / variance /
// risk) cover the Stage 3a table reports. Search + CSV export included.
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TYPE_BADGE = {
  Portfolio: "bg-indigo-100 text-indigo-800",
  Project: "bg-blue-100 text-blue-800",
  "Sub-Project": "bg-cyan-100 text-cyan-800",
  Task: "bg-gray-100 text-gray-700",
  Milestone: "bg-amber-100 text-amber-800",
  Allocation: "bg-emerald-100 text-emerald-800",
};

const COLUMN_SETS = {
  default: [
    { key: "tbType", label: "Type", badge: true },
    { key: "tbName", label: "Name" },
    { key: "tbOwner", label: "Owner" },
    { key: "tbStart", label: "Start", type: "date" },
    { key: "tbFinish", label: "Finish", type: "date" },
    { key: "tbCost", label: "Cost", type: "currency" },
    { key: "tbWork", label: "Work", type: "hours" },
    { key: "tbMDStatus", label: "Status" },
    { key: "tbRisk", label: "Risk" },
    { key: "tbIssuesOpen", label: "Open Issues" },
  ],
  variance: [
    { key: "tbName", label: "Name" },
    { key: "tbType", label: "Type", badge: true },
    { key: "blStart", label: "Baseline Start", type: "date" },
    { key: "tbStart", label: "Actual Start", type: "date" },
    { key: "blStartVariance", label: "Start Var" },
    { key: "blFinish", label: "Baseline Finish", type: "date" },
    { key: "tbFinish", label: "Actual Finish", type: "date" },
    { key: "blFinishVariance", label: "Finish Var" },
    { key: "tbCost", label: "Cost", type: "currency" },
    { key: "blCostVariance", label: "Cost Var" },
  ],
  risk: [
    { key: "tbName", label: "Name" },
    { key: "tbL2", label: "Project" },
    { key: "tbOwner", label: "Owner" },
    { key: "tbMDStatus", label: "Status" },
    { key: "tbMDProbability", label: "Probability" },
    { key: "tbMDImpact", label: "Impact" },
    { key: "tbMDEscalationLevel", label: "Escalation" },
    { key: "tbStart", label: "Raised", type: "date" },
    { key: "tbFinish", label: "Due", type: "date" },
  ],
};

function formatValue(value, type) {
  if (value === null || value === undefined || value === "") return "";
  if (type === "date") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
  if (type === "currency") {
    const n = parseFloat(value);
    return Number.isNaN(n) ? String(value) : `$${n.toLocaleString()}`;
  }
  if (type === "hours") {
    const n = parseFloat(value);
    return Number.isNaN(n) ? String(value) : `${n.toLocaleString()}h`;
  }
  return String(value);
}

function toCsv(rows, columns) {
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => c.label).join(",");
  const body = rows.map((r) => columns.map((c) => escape(r[c.key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

export default function ReportDataTable({ data = [], reportType = "default", pageSize = 200, filename = "report.csv" }) {
  const [search, setSearch] = useState("");
  const columns = COLUMN_SETS[reportType] || COLUMN_SETS.default;

  const rows = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) =>
      columns.some((c) => {
        const v = row[c.key];
        return v != null && String(v).toLowerCase().includes(term);
      })
    );
  }, [data, search, columns]);

  const shown = rows.slice(0, pageSize);

  const handleExport = () => {
    if (rows.length === 0) return;
    const blob = new Blob([toCsv(rows, columns)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
        No data available in this dashboard source.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {shown.length} of {rows.length} shown
          </span>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((row, i) => (
              <TableRow key={row.tbID ?? row.id ?? i} className="hover:bg-gray-50">
                {columns.map((c) => (
                  <TableCell key={c.key} className="whitespace-nowrap text-gray-700">
                    {c.badge && row[c.key] ? (
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[row[c.key]] || "bg-gray-100 text-gray-700"}`}>
                        {row[c.key]}
                      </span>
                    ) : formatValue(row[c.key], c.type) === "" ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      formatValue(row[c.key], c.type)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rows.length > pageSize && (
        <p className="text-xs text-gray-500">Showing the first {pageSize} rows. Refine the search to narrow results.</p>
      )}
    </div>
  );
}
