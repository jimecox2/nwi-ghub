"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import ManageAccessModal from "@/components/intranet/ManageAccessModal";

// Proposals come from the active "Costbars" pubset for the viewer's customer,
// fetched through the RBAC-gated proxy at /api/dashboard/pubsets/active. The
// route returns rows already filtered to Status = "New" and mapped to columns:
//   proposal (tbName), client (tbMDCustomerID), owner (tbOwner),
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

export default function ProposalsTable() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  const [proposals, setProposals] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | unauthenticated | forbidden | empty | error
  const [message, setMessage] = useState("");
  const [pubsetId, setPubsetId] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
          setMessage(data.error || "No proposals available for your account.");
          setState("forbidden");
          return;
        }
        if (!res.ok) {
          setMessage(data.error || "Failed to load proposals.");
          setState("error");
          return;
        }

        const rows = data.proposals || [];
        setProposals(rows);
        setPubsetId(data.pubset?.id ?? null);
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

  // The "Manage Access" button is available to admins even when the proposal
  // list is empty, so it renders above the per-state body below.
  const manageButton =
    canManage && pubsetId ? (
      <button
        type="button"
        onClick={() => setShowManage(true)}
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

  function withToolbar(body) {
    return (
      <div>
        {manageButton ? <div className="mb-4 flex justify-end">{manageButton}</div> : null}
        {body}
        {modal}
      </div>
    );
  }

  if (state === "loading") {
    return <p className="text-sm text-gray-500">Loading proposals…</p>;
  }
  if (state === "unauthenticated") {
    return (
      <p className="text-sm text-gray-600">
        Please{" "}
        <Link href="/login" className="font-medium text-[#0b4d8e] hover:underline">
          log in
        </Link>{" "}
        to view proposal data.
      </p>
    );
  }
  if (state === "forbidden") {
    return <p className="text-sm text-gray-600">{message}</p>;
  }
  if (state === "error") {
    return <p className="text-sm text-red-600">Failed to load proposals: {message}</p>;
  }
  if (state === "empty") {
    return withToolbar(
      <p className="text-sm text-gray-600">No proposals are currently in progress.</p>
    );
  }

  return withToolbar(
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-[#062f57] text-left text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Proposal</th>
            <th className="px-4 py-3 font-semibold">Client</th>
            <th className="px-4 py-3 font-semibold">Owner</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Stage</th>
            <th className="px-4 py-3 font-semibold">Approval State</th>
            <th className="px-4 py-3 text-right font-semibold">Est. Value</th>
            <th className="px-4 py-3 font-semibold">Last Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {proposals.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{p.proposal || "—"}</td>
              <td className="px-4 py-3 text-gray-700">{p.client || "—"}</td>
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
              <td className="px-4 py-3 text-gray-500">{formatDate(p.lastUpdated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
