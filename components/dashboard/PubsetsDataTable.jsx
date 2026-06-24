"use client";

// Ported from migration-staging/pubsets/_components/PubsetsDataTable.jsx.
// Adapted: local UI primitives instead of shadcn, native Intl date formatting
// instead of moment, and the logged-in email comes from the auth store.
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

function formatDate(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const PRODUCT_BADGE = {
  Agilebars: "bg-purple-100 text-purple-800",
  Timebars: "bg-blue-100 text-blue-800",
  Costbars: "bg-orange-100 text-orange-800",
};

const STATUS_BADGE = {
  Final: "bg-green-100 text-green-800",
  Draft: "bg-yellow-100 text-yellow-800",
  Archived: "bg-gray-100 text-gray-600",
};

export default function PubsetsDataTable({ data }) {
  const router = useRouter();
  const userEmail = useAuthStore((s) => s.user?.email);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("published_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedPubsets, setSelectedPubsets] = useState([]);
  const [showOnlyConnected, setShowOnlyConnected] = useState(false);

  const [sourceProductFilter, setSourceProductFilter] = useState("all");
  const [publishStatusFilter, setPublishStatusFilter] = useState("all");
  const [aggregationLevelFilter, setAggregationLevelFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowOnlyConnected(localStorage.getItem("pubsets_show_only_connected") === "true");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pubsets_show_only_connected", String(showOnlyConnected));
    }
  }, [showOnlyConnected]);

  const handleCheckboxToggle = (id) =>
    setSelectedPubsets((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleConsolidatedReport = () => {
    if (selectedPubsets.length > 0) {
      router.push(`/dashboard/pubsets/consolidated?ids=${selectedPubsets.join(",")}`);
    }
  };

  const filteredData = data.filter((item) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      item.name?.toLowerCase().includes(s) ||
      item.owner?.toLowerCase().includes(s) ||
      item.customer_id?.toLowerCase?.().includes(s) ||
      item.users_permissions_user?.toLowerCase().includes(s) ||
      item.division?.toLowerCase().includes(s) ||
      item.cost_center?.toLowerCase().includes(s);
    const matchesConnection = !showOnlyConnected || item.isActive === true;
    const matchesProduct = sourceProductFilter === "all" || item.source_product === sourceProductFilter;
    const matchesStatus = publishStatusFilter === "all" || item.publish_status === publishStatusFilter;
    const matchesAggregation = aggregationLevelFilter === "all" || item.aggregation_level === aggregationLevelFilter;
    const matchesDivision = divisionFilter === "all" || item.division === divisionFilter;
    return matchesSearch && matchesConnection && matchesProduct && matchesStatus && matchesAggregation && matchesDivision;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (sortField === "published_date") {
      aVal = new Date(aVal || 0);
      bVal = new Date(bVal || 0);
    }
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSelectAll = () => {
    if (selectedPubsets.length === sortedData.length) setSelectedPubsets([]);
    else setSelectedPubsets(sortedData.map((i) => i.id));
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortIndicator = (field) => (sortField !== field ? "" : sortDirection === "asc" ? " ↑" : " ↓");

  const uniq = (field) => Array.from(new Set(data.map((i) => i[field]).filter(Boolean)));
  const uniqueProducts = uniq("source_product");
  const uniqueStatuses = uniq("publish_status");
  const uniqueAggregationLevels = uniq("aggregation_level");
  const uniqueDivisions = uniq("division");

  const filtersActive =
    sourceProductFilter !== "all" || publishStatusFilter !== "all" || aggregationLevelFilter !== "all" || divisionFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by name, owner, division, cost center…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        {searchTerm && (
          <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
            Clear
          </Button>
        )}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showOnlyConnected}
            onChange={(e) => setShowOnlyConnected(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Show Only Connected to Dashboard
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: "Client Product", value: sourceProductFilter, set: setSourceProductFilter, opts: uniqueProducts, all: "All Products" },
          { label: "Publish Status", value: publishStatusFilter, set: setPublishStatusFilter, opts: uniqueStatuses, all: "All Statuses" },
          { label: "Aggregation Type", value: aggregationLevelFilter, set: setAggregationLevelFilter, opts: uniqueAggregationLevels, all: "All Types" },
          { label: "Division", value: divisionFilter, set: setDivisionFilter, opts: uniqueDivisions, all: "All Divisions" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{f.label}:</label>
            <select
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="rounded border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="all">{f.all}</option>
              {f.opts.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
        {filtersActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSourceProductFilter("all");
              setPublishStatusFilter("all");
              setAggregationLevelFilter("all");
              setDivisionFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Generate */}
      {selectedPubsets.length > 0 && (
        <div className="flex items-center gap-4">
          <Button onClick={handleConsolidatedReport} className="bg-green-600 hover:bg-green-700">
            Generate Dashboard Source ({selectedPubsets.length} selected)
          </Button>
          <Button variant="outline" onClick={() => setSelectedPubsets([])}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedPubsets.length === sortedData.length && sortedData.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </TableHead>
              <TableHead>Actions</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>ID{sortIndicator("id")}</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>Name{sortIndicator("name")}</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("owner")}>Owner{sortIndicator("owner")}</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("published_date")}>Published{sortIndicator("published_date")}</TableHead>
              <TableHead>Connected</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("source_product")}>Product{sortIndicator("source_product")}</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("publish_status")}>Status{sortIndicator("publish_status")}</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("division")}>Division{sortIndicator("division")}</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("customer_id")}>Customer ID{sortIndicator("customer_id")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-8 text-center text-gray-500">
                  {searchTerm ? "No pubsets match your search" : "No pubsets found"}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPubsets.includes(item.id)}
                      onChange={() => handleCheckboxToggle(item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/pubsets/report/${item.id}`}>
                      <span className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                        View
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-gray-700">{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-gray-700">{item.owner}</TableCell>
                  <TableCell className="text-gray-600">{formatDate(item.published_date)}</TableCell>
                  <TableCell>
                    <span className={`rounded px-2 py-1 text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {item.isActive ? "Connected" : "Not Connected"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.source_product ? (
                      <span className={`rounded px-2 py-1 text-xs font-medium ${PRODUCT_BADGE[item.source_product] || "bg-gray-100 text-gray-800"}`}>
                        {item.source_product}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.publish_status ? (
                      <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_BADGE[item.publish_status] || "bg-gray-100 text-gray-800"}`}>
                        {item.publish_status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-700">{item.division || <span className="text-gray-400">N/A</span>}</TableCell>
                  <TableCell>
                    {item.customer_id ? (
                      <span className="rounded bg-blue-50 px-2 py-1 font-mono text-xs text-blue-700">{item.customer_id}</span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing <strong>{sortedData.length}</strong> pubset{sortedData.length !== 1 ? "s" : ""}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
        {userEmail && <div className="text-xs text-gray-500">Logged in as: {userEmail}</div>}
      </div>
    </div>
  );
}
