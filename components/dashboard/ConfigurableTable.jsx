"use client";

// Generic tabular renderer driven by a columnConfig object
// ({ key: { title, width } }) — the shape used by lib/dashboard/columnConfig.js.
// Portable: any report can feed it rows + a column set (e.g. from ColumnSetPicker).
// Handles click-to-sort (numeric vs string), CSV export, and light value
// formatting (arrays joined, date/currency keys formatted, everything else raw).
import { useMemo, useState } from "react";
import { ArrowUpDown, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DATE_KEY = /(start|finish|date|approved)/i;
const CURRENCY_KEY = /(cost|budgetcost|npv|eva|opportunity|sunk)/i;

function formatValue(value, key) {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);

  // Currency-ish numeric fields (skip hours/score/percent).
  if (CURRENCY_KEY.test(key) && !/hours|score|percent|id/i.test(key)) {
    const n = parseFloat(value);
    if (!Number.isNaN(n)) return `$${n.toLocaleString()}`;
  }
  // Date-ish fields with a parseable date.
  if (DATE_KEY.test(key) && !/variance/i.test(key)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime()) && /[-/]/.test(String(value))) return d.toLocaleDateString();
  }
  return String(value);
}

const rawString = (value) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function ConfigurableTable({ data = [], columnConfig = {}, filename = "report.csv", pageSize = 500 }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const columns = useMemo(() => Object.entries(columnConfig).map(([key, cfg]) => ({ key, ...cfg })), [columnConfig]);

  const sorted = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!sortKey) return data;
    const arr = [...data];
    arr.sort((a, b) => {
      const av = rawString(a[sortKey]);
      const bv = rawString(b[sortKey]);
      const an = parseFloat(av);
      const bn = parseFloat(bv);
      if (!Number.isNaN(an) && !Number.isNaN(bn) && av.trim() !== "" && bv.trim() !== "") {
        return sortDir === "asc" ? an - bn : bn - an;
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return arr;
  }, [data, sortKey, sortDir]);

  const shown = sorted.slice(0, pageSize);

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const exportCsv = () => {
    if (sorted.length === 0 || columns.length === 0) return;
    const escape = (v) => {
      const s = rawString(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = columns.map((c) => escape(c.title)).join(",");
    const body = sorted.map((row) => columns.map((c) => escape(row[c.key])).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (columns.length === 0) {
    return <p className="text-sm text-gray-500">No columns selected.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-gray-500">
          {shown.length} of {sorted.length} rows
        </span>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((c) => (
                <TableHead key={c.key} style={{ minWidth: c.width }}>
                  <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-blue-700">
                    {c.title}
                    <ArrowUpDown className={`h-3 w-3 ${sortKey === c.key ? "text-blue-600" : "text-gray-300"}`} />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-gray-500">
                  No rows match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((row, i) => (
                <TableRow key={row.tbID ?? row.id ?? i} className="hover:bg-gray-50">
                  {columns.map((c) => {
                    const formatted = formatValue(row[c.key], c.key);
                    return (
                      <TableCell key={c.key} className="whitespace-nowrap text-gray-700">
                        {formatted === "" ? <span className="text-gray-300">—</span> : formatted}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sorted.length > pageSize && (
        <p className="text-xs text-gray-500">Showing the first {pageSize} rows. Narrow the filters to see more.</p>
      )}
    </div>
  );
}
