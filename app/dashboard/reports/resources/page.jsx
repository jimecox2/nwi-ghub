"use client";

// Resource Pool — the source's tbresources array. Columns are derived from the
// data since the resource-pool shape varies by product.
import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import ReportShell from "@/components/dashboard/ReportShell";
import ResourceNotice from "@/components/dashboard/charts/ResourceNotice";

// Prefer these columns (in order) when present; otherwise fall back to the first
// keys found on the data.
const PREFERRED = [
  "tbResID", "tbResName", "tbMDNameShort", "tbMDPrimaryRole", "tbMDPrimarySkill",
  "tbMDLocation", "tbMDDepartment", "tbResAvailability", "tbResRate",
];

function ResourcesTable({ resources }) {
  const [search, setSearch] = useState("");

  const columns = useMemo(() => {
    const keys = new Set();
    resources.slice(0, 20).forEach((r) => Object.keys(r || {}).forEach((k) => keys.add(k)));
    const preferred = PREFERRED.filter((k) => keys.has(k));
    if (preferred.length >= 3) return preferred;
    return Array.from(keys).slice(0, 10);
  }, [resources]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return resources;
    return resources.filter((r) => columns.some((c) => String(r[c] ?? "").toLowerCase().includes(term)));
  }, [resources, search, columns]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Input placeholder="Search resources…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <span className="text-xs text-gray-500">{rows.length} resources</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((c) => (
                <TableHead key={c}>{c.replace(/^tb(MD)?/, "")}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 300).map((r, i) => (
              <TableRow key={r.tbResID ?? r.id ?? i} className="hover:bg-gray-50">
                {columns.map((c) => (
                  <TableCell key={c} className="whitespace-nowrap text-gray-700">
                    {r[c] === null || r[c] === undefined || r[c] === "" ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      String(r[c])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function ResourcePoolPage() {
  return (
    <ReportShell title="Resource Pool" icon={Users} subtitle="Resource capacity and allocation data from the active source.">
      {({ dashboardSource }) => {
        const resources = Array.isArray(dashboardSource.tbresources) ? dashboardSource.tbresources : [];
        if (resources.length === 0) {
          return (
            <ResourceNotice title="No Resource Pool Data">
              <p>This dashboard source has no tbresources data. Resource pools come from Timebars or Costbars pubsets.</p>
            </ResourceNotice>
          );
        }
        return <ResourcesTable resources={resources} />;
      }}
    </ReportShell>
  );
}
