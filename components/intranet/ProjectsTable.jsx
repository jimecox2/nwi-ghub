"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import ManageAccessModal from "@/components/intranet/ManageAccessModal";
import ProjectDetailDrawer from "@/components/intranet/ProjectDetailDrawer";

// Projects come from the active "Costbars" pubset for the viewer's customer,
// fetched through the RBAC-gated proxy at /api/dashboard/pubsets/active. The
// route returns rows already filtered to Status = "New" and mapped to columns:
//   project (tbName), client (tbMDCustomerID), owner (tbOwner),
//   status (tbMDStatus), stage (tbMDStage), approvalState (tbMDState),
//   estValue (tbBudgetCost), lastUpdated (tbMDtbLastModified).
const stageStyles = {
  "1 Proposed": "bg-gray-100 text-gray-700",
  "2 Triaged": "bg-amber-100 text-amber-800",
  "3 Prioritized": "bg-blue-100 text-blue-800",
  "4 Selected": "bg-indigo-100 text-indigo-800",
  "5 Assigned": "bg-green-100 text-green-800",
};

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProjectsTable() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  const [projects, setProjects] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | unauthenticated | forbidden | empty | error
  const [message, setMessage] = useState("");
  const [pubsetId, setPubsetId] = useState(null);
  const [publishedDate, setPublishedDate] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [detailTbID, setDetailTbID] = useState(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      setState("unauthenticated");
      return;
    }

    let active = true;
    (async () => {
      setState("loading");
      try {
        const res = await fetch("/api/dashboard/pubsets/active?product=Costbars");
        const data = await res.json().catch(() => ({}));
        if (!active) return;

        if (res.status === 403 || res.status === 404) {
          setMessage(data.error || "No projects available for your account.");
          setState("forbidden");
          return;
        }
        if (!res.ok) {
          setMessage(data.error || "Failed to load projects.");
          setState("error");
          return;
        }

        const rows = data.projects || [];
        setProjects(rows);
        setPubsetId(data.pubset?.id ?? null);
        setPublishedDate(data.publishedDate ?? null);
        setCanManage(Boolean(data.canManageAccess));
        setState(rows.length ? "ready" : "empty");
      } catch (err) {
        if (active) {
          setMessage(err.message);
          setState("error");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [hydrated, user, reloadKey]);

  // The "Manage Access" button is available to admins even when the project
  // list is empty, so it renders above the per-state body below.
  const manageButton =
    canManage && pubsetId ? (
      <button
        type="button"
        onClick={() => setShowManage(true)}
        title="Grants temporary access. These grants will be overridden by the next publish."
        className="rounded-md border border-[#0b4d8e] px-3 py-1.5 text-sm font-medium text-[#0b4d8e] hover:bg-[#0b4d8e] hover:text-white"
      >
        Manage Access
      </button>
    ) : null;

  const modal = showManage && pubsetId ? (
    <ManageAccessModal
      pubsetId={pubsetId}
      onClose={() => setShowManage(false)}
      onSaved={() => setReloadKey((k) => k + 1)}
    />
  ) : null;

  const drawer = detailTbID ? (
    <ProjectDetailDrawer tbID={detailTbID} onClose={() => setDetailTbID(null)} />
  ) : null;

  function withToolbar(body) {
    return (
      <div>
        <div className="mb-2 flex items-center gap-4 text-sm">
          <a
            href="https://tb.timebars.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0b4d8e] hover:underline"
          >
            Timebars
          </a>
          <a
            href="https://cb.timebars.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0b4d8e] hover:underline"
          >
            Costbars
          </a>
        </div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Last published on: {publishedDate ? formatDate(publishedDate) : "—"}
          </p>
          {manageButton}
        </div>
        {body}
        {modal}
        {drawer}
      </div>
    );
  }

  if (state === "loading") {
    return <p className="text-sm text-gray-500">Loading projects…</p>;
  }
  if (state === "unauthenticated") {
    return (
      <p className="text-sm text-gray-600">
        Please{" "}
        <Link href="/login" className="font-medium text-[#0b4d8e] hover:underline">
          log in
        </Link>{" "}
        to view project data.
      </p>
    );
  }
  if (state === "forbidden") {
    return <p className="text-sm text-gray-600">{message}</p>;
  }
  if (state === "error") {
    return <p className="text-sm text-red-600">Failed to load projects: {message}</p>;
  }
  if (state === "empty") {
    return withToolbar(
      <p className="text-sm text-gray-600">No projects are currently in progress.</p>
    );
  }

  return withToolbar(
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-[#062f57] text-left text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">ID</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold" style={{ minWidth: 150, maxWidth: 300 }}>
              Name
            </th>
            <th className="px-4 py-3 font-semibold">Owner</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Stage</th>
            <th className="px-4 py-3 font-semibold">Approval State</th>
            <th className="px-4 py-3 text-right font-semibold">Est. Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 tabular-nums text-gray-500">{p.tbID || "—"}</td>
              <td className="px-4 py-3 text-gray-700">{p.projectType || "—"}</td>
              <td
                className="px-4 py-3 font-medium text-gray-900"
                style={{ minWidth: 150, maxWidth: 300 }}
              >
                {p.tbID ? (
                  <button
                    type="button"
                    onClick={() => setDetailTbID(p.tbID)}
                    className="text-left text-[#0b4d8e] hover:underline"
                  >
                    {p.project || "—"}
                  </button>
                ) : (
                  p.project || "—"
                )}
              </td>
              <td className="px-4 py-3 text-gray-700">{p.owner || "—"}</td>
              <td className="px-4 py-3 text-gray-700">{p.status || "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    stageStyles[p.stage] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {p.stage || "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{p.approvalState || "—"}</td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                {formatCurrency(p.estValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
