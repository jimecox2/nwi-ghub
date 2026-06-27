"use client";

// Generic tabular renderer driven by a columnConfig object
// ({ key: { title, width } }) — the shape used by lib/dashboard/columnConfig.js.
// Portable: any report can feed it rows + a column set (e.g. from ColumnSetPicker).
//
// - Column widths are honored via table-layout:fixed + <colgroup>; text wraps.
// - Cell values containing HTML are rendered as HTML (internal Strapi-authored
//   content; see the security note on renderCell).
// - A synced top scrollbar mirrors the table's horizontal scroll; both bars are
//   styled navy via the .sir-scroll class in globals.css.
import { useMemo, useRef, useState } from "react";
import { ArrowUpDown, Download } from "lucide-react";

const DATE_KEY = /(start|finish|date|approved)/i;
const CURRENCY_KEY = /(cost|budgetcost|npv|eva|opportunity|sunk)/i;
const HTML_RE = /<([a-z][a-z0-9]*)\b[^>]*>/i;

function parseWidth(w) {
  const n = parseInt(String(w ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 120;
}

const rawString = (value) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// Scalar formatting (currency/date) for plain values; HTML/array handled in renderCell.
function formatScalar(value, key) {
  if (CURRENCY_KEY.test(key) && !/hours|score|percent|id/i.test(key)) {
    const n = parseFloat(value);
    if (!Number.isNaN(n)) return `$${n.toLocaleString()}`;
  }
  if (DATE_KEY.test(key) && !/variance/i.test(key)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime()) && /[-/]/.test(String(value))) return d.toLocaleDateString();
  }
  return String(value);
}

function renderCell(value, key) {
  if (value === null || value === undefined || value === "") return <span className="text-gray-300">—</span>;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  // NOTE: dashboard data is authored by internal users in Strapi; we render its
  // rich-text fields as-is. If this ever sources untrusted content, sanitize
  // (e.g. DOMPurify) before setting innerHTML.
  if (typeof value === "string" && HTML_RE.test(value)) {
    return <div className="sir-html" dangerouslySetInnerHTML={{ __html: value }} />;
  }
  return formatScalar(value, key);
}

export default function ConfigurableTable({ data = [], columnConfig = {}, filename = "report.csv", pageSize = 500 }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const topRef = useRef(null);
  const bodyRef = useRef(null);
  const lock = useRef(false);

  const columns = useMemo(
    () => Object.entries(columnConfig).map(([key, cfg]) => ({ key, title: cfg.title, width: parseWidth(cfg.width) })),
    [columnConfig]
  );
  const totalWidth = useMemo(() => columns.reduce((s, c) => s + c.width, 0), [columns]);

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

  // Keep the top scrollbar and the table body in horizontal sync.
  const syncScroll = (from, to) => {
    if (lock.current || !from || !to) return;
    lock.current = true;
    to.scrollLeft = from.scrollLeft;
    requestAnimationFrame(() => {
      lock.current = false;
    });
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
    <div className="space-y-2">
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

      {/* Top scrollbar (synced with the table below) */}
      <div
        ref={topRef}
        onScroll={() => syncScroll(topRef.current, bodyRef.current)}
        className="sir-scroll overflow-x-auto overflow-y-hidden rounded"
        style={{ height: 16 }}
      >
        <div style={{ width: totalWidth, height: 1 }} />
      </div>

      {/* Table */}
      <div
        ref={bodyRef}
        onScroll={() => syncScroll(bodyRef.current, topRef.current)}
        className="sir-scroll overflow-x-auto rounded-lg border border-gray-200"
      >
        <table className="border-collapse text-sm" style={{ tableLayout: "fixed", width: totalWidth }}>
          <colgroup>
            {columns.map((c) => (
              <col key={c.key} style={{ width: `${c.width}px` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-gray-50">
              {columns.map((c) => (
                <th key={c.key} className="border-b border-gray-200 px-3 py-2 text-left align-top font-semibold text-gray-700">
                  <button onClick={() => toggleSort(c.key)} className="inline-flex items-start gap-1 break-words text-left hover:text-blue-700">
                    {c.title}
                    <ArrowUpDown className={`mt-0.5 h-3 w-3 flex-shrink-0 ${sortKey === c.key ? "text-blue-600" : "text-gray-300"}`} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500">
                  No rows match the current filters.
                </td>
              </tr>
            ) : (
              shown.map((row, i) => (
                <tr key={row.tbID ?? row.id ?? i} className="border-b border-gray-100 hover:bg-gray-50">
                  {columns.map((c) => (
                    <td key={c.key} className="whitespace-normal break-words px-3 py-2 align-top text-gray-700">
                      {renderCell(row[c.key], c.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <p className="text-xs text-gray-500">Showing the first {pageSize} rows. Narrow the filters to see more.</p>
      )}
    </div>
  );
}
