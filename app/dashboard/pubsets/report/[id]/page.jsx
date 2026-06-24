"use client";

// Single-pubset report view. Fetches one pubset via the proxy (RBAC-checked)
// and renders its items. Replaces the never-staged PubsetReportComponent with
// the shared ItemsTable.
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import ItemsTable from "@/components/dashboard/ItemsTable";

export default function PubsetReportPage({ params }) {
  // Next 16: route params are a Promise; unwrap with React.use().
  const { id } = use(params);

  const [pubset, setPubset] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/dashboard/pubsets/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Failed to load pubset");
        }
        return res.json();
      })
      .then((data) => active && setPubset(data.pubset))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard/pubsets" className="text-blue-600 hover:underline">
          ← Back to Pubsets
        </Link>
        {pubset && (
          <>
            <h1 className="mt-2 text-2xl font-bold">Pubset Report: {pubset.name}</h1>
            <p className="text-gray-600">Owner: {pubset.owner}</p>
          </>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

      {!error && pubset === null && (
        <div className="flex items-center justify-center py-12 text-gray-600">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-blue-600" />
          Loading pubset…
        </div>
      )}

      {!error && pubset && <ItemsTable data={pubset.tbmdjoined || []} />}
    </div>
  );
}
