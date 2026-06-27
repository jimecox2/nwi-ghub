"use client";

// Tasks Tagged with Show In — a configurable tabular report. The user picks a
// column set (which fields to display) and filters rows by Show In tag, project
// (L2), and name. Ported from the legacy Timebars Show In report onto the
// dashboard's cookie-auth hook + reusable ColumnSetPicker/ConfigurableTable.
import { useMemo, useState } from "react";
import { Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReportShell from "@/components/dashboard/ReportShell";
import ColumnSetPicker from "@/components/dashboard/ColumnSetPicker";
import ConfigurableTable from "@/components/dashboard/ConfigurableTable";
import { COLUMN_SETS, DEFAULT_COLUMN_SET } from "@/lib/dashboard/columnConfig";

// tbMDShowIn may be an array or a comma-separated string; normalize to an array.
function showInValues(item) {
  const v = item.tbMDShowIn;
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function ShowInBody({ adaptedData }) {
  const allRows = adaptedData?.allRows || [];

  const [columnSet, setColumnSet] = useState(DEFAULT_COLUMN_SET);
  const [nameSearch, setNameSearch] = useState("");
  const [l2Filter, setL2Filter] = useState("all");
  const [showInFilter, setShowInFilter] = useState("all");

  const l2Options = useMemo(
    () => [...new Set(allRows.map((r) => r.tbL2).filter(Boolean))].sort(),
    [allRows]
  );
  const showInOptions = useMemo(
    () => [...new Set(allRows.flatMap(showInValues))].sort(),
    [allRows]
  );

  const filtered = useMemo(() => {
    const term = nameSearch.trim().toLowerCase();
    return allRows.filter((item) => {
      const nameMatch = !term || (item.tbName || "").toLowerCase().includes(term);
      const l2Match = l2Filter === "all" || item.tbL2 === l2Filter;
      const showInMatch = showInFilter === "all" || showInValues(item).includes(showInFilter);
      return nameMatch && l2Match && showInMatch;
    });
  }, [allRows, nameSearch, l2Filter, showInFilter]);

  const reset = () => {
    setNameSearch("");
    setL2Filter("all");
    setShowInFilter("all");
    setColumnSet(DEFAULT_COLUMN_SET);
  };

  const columnConfig = COLUMN_SETS[columnSet]?.config || COLUMN_SETS[DEFAULT_COLUMN_SET].config;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Input
          placeholder="Search by name…"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          className="max-w-md bg-white"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            title="Project (L2) filter"
            value={l2Filter}
            onChange={(e) => setL2Filter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="all">All Projects (L2)</option>
            {l2Options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <select
            title="Show In filter"
            value={showInFilter}
            onChange={(e) => setShowInFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="all">All Show In</option>
            {showInOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <ColumnSetPicker value={columnSet} onChange={setColumnSet} />

          <Button variant="outline" size="sm" onClick={reset} className="ml-auto">
            Reset
          </Button>
        </div>
      </div>

      <ConfigurableTable data={filtered} columnConfig={columnConfig} filename="tasks-show-in.csv" />
    </div>
  );
}

export default function ShowInReportPage() {
  return (
    <ReportShell
      title="Tasks Tagged with Show In"
      icon={Tag}
      subtitle="Pick a column set and filter items by Show In tag, project, or name."
    >
      {({ adaptedData }) => <ShowInBody adaptedData={adaptedData} />}
    </ReportShell>
  );
}
