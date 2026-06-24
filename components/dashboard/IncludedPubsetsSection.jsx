"use client";

// Ported from migration-staging/pubsets/consolidated/_components/IncludedPubsetsSection.jsx.
// Adapted: role from the auth store, create+preprocess via the API proxy
// (server sets owner/Customer_id and uses the admin token), local UI primitives.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Save, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { canManageDashboardSources } from "@/lib/auth/rbac";
import { buildInflightRollup } from "@/lib/dashboard/rollup";

const PRODUCT_BADGE = {
  Agilebars: "bg-purple-100 text-purple-800",
  Timebars: "bg-blue-100 text-blue-800",
  Costbars: "bg-orange-100 text-orange-800",
};

export default function IncludedPubsetsSection({ pubsets, consolidatedData }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canCreate = canManageDashboardSources(user);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dashboardName, setDashboardName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'preprocessing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const generateSourceName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const products = [...new Set(pubsets.map((p) => p.source_product).filter(Boolean))];
    const productLabel = products.length === 1 ? products[0] : products.length > 1 ? "Mixed" : "Unknown";
    const names = pubsets.map((p) => p.name).filter(Boolean);
    const namesStr = names.length <= 3 ? names.join(", ") : `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
    const idsStr = pubsets.map((p) => p.id).join("-");
    return `${productLabel} — ${namesStr} [${idsStr}] — ${dateStr} ${timeStr}`;
  };

  const openDialog = () => {
    setSaveStatus(null);
    setErrorMessage("");
    setDashboardName(generateSourceName());
    setShowDialog(true);
  };

  const firstWith = (field) =>
    pubsets.find((p) => (Array.isArray(p[field]) ? p[field].length > 0 : !!p[field]))?.[field] || null;

  const uniqueValues = (field) =>
    [...new Set(pubsets.map((p) => p[field]).filter((v) => v !== null && v !== undefined && v !== ""))].join(", ");

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    setErrorMessage("");

    try {
      const name = dashboardName.trim() || generateSourceName();
      const mergedCharts = [];
      pubsets.forEach((p) => {
        if (Array.isArray(p.tbcharts) && p.tbcharts.length > 0) mergedCharts.push(...p.tbcharts);
      });
      const rollup = buildInflightRollup(consolidatedData);

      const body = {
        name,
        tbmdjoined: consolidatedData || [],
        tbresources: firstWith("tbresources"),
        tbtags: firstWith("tbtags"),
        tbcharts: mergedCharts.length > 0 ? mergedCharts : null,
        tbdocuments: pubsets.map((p) => ({
          id: p.id,
          name: p.name,
          owner: p.owner,
          source_product: p.source_product,
          publish_status: p.publish_status,
        })),
        tb: rollup?.tb || null,
        tbmd: rollup?.tbmd || null,
        source_product: pubsets[0]?.source_product || null,
        aggregation_level: uniqueValues("aggregation_level") || null,
        publish_status: "Final",
        division: uniqueValues("division") || null,
        cost_center: uniqueValues("cost_center") || null,
        geographic_region: uniqueValues("geographic_region") || null,
        isActive: true,
        published_date: new Date().toISOString(),
        uid: pubsets.map((p) => p.id).join("-"),
      };

      // owner + Customer_id are set server-side from the session.
      const res = await fetch("/api/dashboard/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save dashboard source");

      const created = data.source;
      const newId = created?.id;

      // Auto-preprocess if Allocation rows exist.
      const hasAllocations = (consolidatedData || []).some((r) => r.tbType === "Allocation");
      if (newId && hasAllocations) {
        setSaveStatus("preprocessing");
        await fetch(`/api/dashboard/sources/${newId}/preprocess`, { method: "POST" }).catch(() => {});
      }

      setSaveStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err) {
      setSaveStatus("error");
      setErrorMessage(err.message || "Failed to save dashboard source");
    } finally {
      setIsSaving(false);
    }
  };

  const busy = isSaving || saveStatus === "preprocessing" || saveStatus === "success";

  return (
    <>
      <div className="mb-6">
        {canCreate ? (
          <button
            onClick={openDialog}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-blue-700"
          >
            <Save className="h-6 w-6" />
            Save As Dashboard Source
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Administrator, Project Manager, or Executive role required to save dashboard sources</span>
          </div>
        )}
      </div>

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900 hover:text-blue-700"
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          <span>Included Pubsets ({pubsets.length})</span>
        </button>

        {isExpanded && (
          <div className="space-y-3">
            {pubsets.map((p) => (
              <div key={p.id} className="rounded border border-blue-100 bg-white p-3">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className="font-mono font-semibold text-gray-600">ID: {p.id}</span>
                  <span className="font-medium text-gray-900">{p.name}</span>
                  <span className="text-gray-600">Owner: {p.owner}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {p.source_product && (
                    <span className={`rounded px-2 py-1 font-medium ${PRODUCT_BADGE[p.source_product] || "bg-gray-100 text-gray-800"}`}>
                      {p.source_product}
                    </span>
                  )}
                  {p.division && <span className="text-gray-600">Division: {p.division}</span>}
                  {p.cost_center && <span className="text-gray-600">Cost Center: {p.cost_center}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={(v) => !busy && setShowDialog(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save As Dashboard Source</DialogTitle>
            <DialogDescription>
              Create a dashboard source from {pubsets.length} selected pubset{pubsets.length !== 1 ? "s" : ""} containing{" "}
              {consolidatedData?.length || 0} items.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="dashboard-name">Dashboard Source Name</Label>
              <Input
                id="dashboard-name"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="Enter a name for this dashboard source"
                disabled={busy}
              />
            </div>

            {saveStatus === "preprocessing" && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Source saved. Auto-preprocessing resource allocation data…</span>
              </div>
            )}
            {saveStatus === "success" && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span>Dashboard source saved successfully!</span>
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                <XCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Failed to save</p>
                  {errorMessage && <p className="text-sm">{errorMessage}</p>}
                </div>
              </div>
            )}

            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Source Pubsets:</strong> {pubsets.map((p) => p.name).join(", ")}</p>
              <p><strong>Total Items:</strong> {consolidatedData?.length || 0} (all hierarchy levels)</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={busy}>
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
              ) : saveStatus === "success" ? (
                <><CheckCircle className="mr-2 h-4 w-4" />Saved</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Save</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
