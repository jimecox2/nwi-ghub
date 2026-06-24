"use client";

// Make Sources. Lists pubsets the user may access (RBAC-filtered server-side by
// /api/dashboard/pubsets), lets them select pubsets and generate a dashboard
// source. AuthGuard is applied by app/dashboard/layout.jsx.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import PubsetsDataTable from "@/components/dashboard/PubsetsDataTable";

export default function PubsetsPage() {
  const [pubsets, setPubsets] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard/pubsets")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load pubsets"))))
      .then((data) => active && setPubsets(data.pubsets || []))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">Manage Pubsets &amp; Make Dashboard Sources</h1>
        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p>
            <strong>Creating Dashboard Sources:</strong> a dashboard source is a consolidated view that combines data from multiple
            pubsets, giving you executive-level insights across all your projects in one place.
          </p>
          <p>
            <strong>How to create:</strong> use the checkboxes to select the project pubsets you want to analyze together, then click
            <em> Generate Dashboard Source</em>. You&apos;ll review the combined data before saving it as a dashboard source.
          </p>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/sources"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
          >
            View Enterprise Dashboard Sources
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">Error loading pubsets: {error}</div>
      )}

      {!error && pubsets === null && (
        <div className="flex items-center justify-center py-12 text-gray-600">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-blue-600" />
          Loading pubsets…
        </div>
      )}

      {!error && pubsets !== null && <PubsetsDataTable data={pubsets} />}

      {!error && pubsets !== null && pubsets.length === 0 && (
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <strong>No pubsets available.</strong> You don&apos;t have access to any published datasets. Contact your administrator if you
          believe this is incorrect.
        </div>
      )}

      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Understanding Access Control (RBAC)</h2>
        <ul className="ml-2 list-inside list-disc space-y-2 text-sm text-gray-700">
          <li><strong>Owner:</strong> you always have access to pubsets you created.</li>
          <li><strong>Administrator:</strong> sees all pubsets within their customer organization.</li>
          <li><strong>Project Manager:</strong> sees pubsets where granted access via the PM grant list.</li>
          <li><strong>Team Member:</strong> sees pubsets where granted access via the TM grant list.</li>
          <li><strong>No role/grants:</strong> users without roles or grants only see their own pubsets.</li>
        </ul>
      </div>
    </div>
  );
}
