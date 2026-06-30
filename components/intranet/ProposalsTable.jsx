"use client";

import Link from "next/link";
import { useEnterpriseDashboardSource } from "@/hooks/useEnterpriseDashboardSource";

// Proposals = active dashboard-source rows where Status is "New" and the item
// is in one of the early workflow stages. Field mapping (tbmdjoined row -> column):
//   Proposal       -> tbName
//   Client         -> tbMDCustomerID
//   Owner          -> tbOwner
//   Status         -> tbMDStatus
//   Stage          -> tbMDStage
//   Approval State -> tbMDState
//   Est. Value     -> tbBudgetCost
//   Last Updated   -> tbMDtbLastModified
const PROPOSAL_STAGES = [
  "1 Proposed",
  "2 Triaged",
  "3 Prioritized",
  "4 Selected",
  "5 Assigned",
];

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
  const { dashboardSource, status, isLoading, error } =
    useEnterpriseDashboardSource({ autoPreprocess: false });

  const rows = (dashboardSource?.tbmdjoined || []).filter(
    (r) => r.tbMDStatus === "New" && PROPOSAL_STAGES.includes(r.tbMDStage)
  );

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading proposals…</p>;
  }
  if (status === "unauthenticated") {
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
  if (error) {
    return <p className="text-sm text-red-600">Failed to load proposals: {error}</p>;
  }
  if (!dashboardSource) {
    return (
      <p className="text-sm text-gray-600">
        No active dashboard source found. Activate a source in the dashboard to
        populate this list.
      </p>
    );
  }
  if (rows.length === 0) {
    return <p className="text-sm text-gray-600">No proposals are currently in progress.</p>;
  }

  return (
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
          {rows.map((r) => (
            <tr key={r.tbID ?? `${r.tbName}-${r.tbMDCustomerID}`} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{r.tbName || "—"}</td>
              <td className="px-4 py-3 text-gray-700">{r.tbMDCustomerID || "—"}</td>
              <td className="px-4 py-3 text-gray-700">{r.tbOwner || "—"}</td>
              <td className="px-4 py-3 text-gray-700">{r.tbMDStatus || "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    stageStyles[r.tbMDStage] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {r.tbMDStage || "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{r.tbMDState || "—"}</td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                {formatCurrency(r.tbBudgetCost)}
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(r.tbMDtbLastModified)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
