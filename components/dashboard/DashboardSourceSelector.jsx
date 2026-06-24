"use client";

// Ported from migration-staging/sources/_components/DashboardSourceSelector.jsx.
// Adapted: self-contained data via the API proxy (cookie auth), role from the
// auth store, native <select> for switching, local UI primitives. Notifies the
// parent of the active source via onActiveChange.
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, Database, Trash2, Share2, AlertCircle, CheckCircle2, Info, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { canManageDashboardSources, canDeleteDashboardSource } from "@/lib/auth/rbac";
import { buildInflightRollupSummary } from "@/lib/dashboard/rollup";
import ShareDialog from "./ShareDialog";

function downloadCsv(rows, filename) {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const str = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardSourceSelector({ onActiveChange }) {
  const user = useAuthStore((s) => s.user);
  const userEmail = user?.email;

  const [sources, setSources] = useState([]);
  const [activeSource, setActiveSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const setActive = useCallback(
    (source) => {
      setActiveSource(source);
      onActiveChange?.(source);
    },
    [onActiveChange]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/sources");
      if (!res.ok) throw new Error("Failed to load dashboard sources");
      const { sources: list } = await res.json();
      setSources(list || []);

      const current = list?.find((s) => s.isActive) || null;
      if (current) {
        setActive(current);
      } else if (list && list.length > 0) {
        // Activate the most recent if none active yet.
        await fetch("/api/dashboard/sources/active", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceId: list[0].id }),
        });
        setActive(list[0]);
      } else {
        setActive(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setActive]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSwitch = async (sourceId) => {
    try {
      const res = await fetch("/api/dashboard/sources/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId }),
      });
      if (!res.ok) throw new Error("Failed to set active source");
      setActive(sources.find((s) => s.id.toString() === sourceId.toString()) || null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!activeSource) return;
    if (!window.confirm(`Delete "${activeSource.name}"?\n\nThis cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/sources/${activeSource.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to delete dashboard source");
      }
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!activeSource) return;
    downloadCsv(activeSource.tb, "tbTimebars.csv");
    downloadCsv(activeSource.tbmd, "tbMetaData.csv");
  };

  const handleDownloadSummaryCsv = () => {
    if (!activeSource?.tbmdjoined) return;
    const summary = buildInflightRollupSummary(activeSource.tbmdjoined);
    if (!summary) return;
    downloadCsv(summary.tb, "tbTimebars_summary.csv");
    downloadCsv(summary.tbmd, "tbMetaData_summary.csv");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-600">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
        Loading dashboard sources…
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">Error: {error}</div>;
  }

  if (sources.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <h3 className="mb-3 font-semibold text-yellow-900">No Dashboard Sources Found</h3>
        <p className="text-sm text-yellow-800">
          Dashboard sources combine data from your published pubsets. Create your first source from the{" "}
          <Link href="/dashboard/pubsets" className="font-medium underline hover:text-yellow-900">
            Make Sources page
          </Link>
          .
        </p>
      </div>
    );
  }

  const isOwned = activeSource?.owner === userEmail;
  const canShare = canManageDashboardSources(user);
  const canDelete = canDeleteDashboardSource(user, activeSource);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Manage Dashboard Sources</h1>
        </div>
        <p className="text-gray-600">
          Your enterprise reports use the active dashboard source below. Switch sources, delete ones you own, or share them. Create
          a new source from the{" "}
          <Link href="/dashboard/pubsets" className="font-medium text-blue-600 hover:underline">
            Make Sources page
          </Link>
          .
        </p>
      </div>

      {activeSource && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-green-900">Active Source</h2>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-gray-900">{activeSource.name}</p>
              <p className="mt-1 text-sm text-gray-600">
                {activeSource.tbmdjoined?.length || 0} items
                <span className="ml-3">Owner: {activeSource.owner}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isOwned && canShare && (
                <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              )}
              {activeSource?.tb && (
                <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
                  <Download className="h-4 w-4" /> Download CSV
                </Button>
              )}
              {activeSource?.tbmdjoined && (
                <Button variant="outline" size="sm" onClick={handleDownloadSummaryCsv}>
                  <Download className="h-4 w-4" /> Summary CSV
                </Button>
              )}
              {canDelete && (
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {isDeleting ? "Deleting…" : "Delete"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {sources.length === 1 && activeSource && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-1 font-semibold text-blue-900">This is your only dashboard source</h3>
              <p className="text-sm text-blue-800">
                All enterprise reports draw their data from this source. Create more from the{" "}
                <Link href="/dashboard/pubsets" className="font-medium underline hover:text-blue-900">
                  Make Sources page
                </Link>{" "}
                to compare datasets.
              </p>
            </div>
          </div>
        </div>
      )}

      {sources.length > 1 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Switch to a different source ({sources.length} available)
          </label>
          <select
            value={activeSource?.id?.toString() || ""}
            onChange={(e) => handleSwitch(e.target.value)}
            className="max-w-xl rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {sources.map((s) => (
              <option key={s.id} value={s.id.toString()}>
                {s.name} ({s.tbmdjoined?.length || 0} items){s.owner !== userEmail ? ` — shared by ${s.owner}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeSource && (
        <ShareDialog
          source={activeSource}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
