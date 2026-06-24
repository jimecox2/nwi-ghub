"use client";

// Lean replacement for the never-staged ConsolidatedReportComponent /
// PubsetReportComponent. Renders tbmdjoined-style rows in a searchable table
// with the common project fields. Used by the consolidated review, the
// single-pubset report, and the sources page content.
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const COLUMNS = [
  { key: "tbType", label: "Type" },
  { key: "tbName", label: "Name" },
  { key: "tbL1", label: "L1" },
  { key: "tbL2", label: "L2" },
  { key: "tbOwner", label: "Owner" },
  { key: "tbStart", label: "Start" },
  { key: "tbFinish", label: "Finish" },
  { key: "tbCost", label: "Cost" },
  { key: "tbWork", label: "Work" },
  { key: "tbMDStatus", label: "Status" },
];

const TYPE_BADGE = {
  Portfolio: "bg-indigo-100 text-indigo-800",
  Project: "bg-blue-100 text-blue-800",
  "Sub-Project": "bg-cyan-100 text-cyan-800",
  Task: "bg-gray-100 text-gray-700",
  Milestone: "bg-amber-100 text-amber-800",
  Allocation: "bg-emerald-100 text-emerald-800",
};

export default function ItemsTable({ data = [], pageSize = 100 }) {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) =>
      [row.tbName, row.tbType, row.tbOwner, row.tbL1, row.tbL2]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [data, search]);

  const shown = rows.slice(0, pageSize);

  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-sm text-gray-500">No items to display.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search items by name, type, owner…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <span className="text-xs text-gray-500">
          {shown.length} of {rows.length} shown
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {COLUMNS.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((row, i) => (
              <TableRow key={row.tbID ?? row.id ?? i} className="hover:bg-gray-50">
                {COLUMNS.map((c) => (
                  <TableCell key={c.key} className="whitespace-nowrap text-gray-700">
                    {c.key === "tbType" && row.tbType ? (
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[row.tbType] || "bg-gray-100 text-gray-700"}`}>
                        {row.tbType}
                      </span>
                    ) : (
                      formatCell(row[c.key])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rows.length > pageSize && (
        <p className="text-xs text-gray-500">
          Showing the first {pageSize} rows. Refine the search to narrow results.
        </p>
      )}
    </div>
  );
}

function formatCell(value) {
  if (value === null || value === undefined || value === "") return <span className="text-gray-300">—</span>;
  return String(value);
}
