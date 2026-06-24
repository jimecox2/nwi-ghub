"use client";

// Dashboard Data Source Review. Fetches the selected pubsets (RBAC-checked by
// the proxy), merges their tbmdjoined (prefixing tbID with the source pubset
// id), previews Portfolio/Project items, and offers "Save As Dashboard Source".
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ItemsTable from "@/components/dashboard/ItemsTable";
import IncludedPubsetsSection from "@/components/dashboard/IncludedPubsetsSection";

function mergeAndFilterPubsetData(pubsets) {
  let merged = [];
  for (const pubset of pubsets) {
    if (Array.isArray(pubset.tbmdjoined)) {
      const prefixed = pubset.tbmdjoined.map((item) => ({
        ...item,
        tbID: `${pubset.id}-${item.tbID || ""}`,
        tbSelfKey2: item.tbSelfKey2 ? `${pubset.id}-${item.tbSelfKey2}` : item.tbSelfKey2,
      }));
      merged = [...merged, ...prefixed];
    }
  }
  const filtered = merged.filter((i) => i.tbType === "Portfolio" || i.tbType === "Project");
  return { allData: merged, filteredData: filtered };
}

function ConsolidatedReview() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") || "";

  const [pubsets, setPubsets] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ids) {
      setPubsets([]);
      return;
    }
    let active = true;
    fetch(`/api/dashboard/pubsets/by-ids?ids=${encodeURIComponent(ids)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load pubsets"))))
      .then((data) => active && setPubsets(data.pubsets || []))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [ids]);

  const { allData, filteredData } = useMemo(
    () => (pubsets ? mergeAndFilterPubsetData(pubsets) : { allData: [], filteredData: [] }),
    [pubsets]
  );

  if (!ids) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-4 text-2xl font-bold text-red-600">No Pubsets Selected</h1>
        <p>Please select pubsets from the Make Sources page to generate a dashboard source.</p>
        <Link href="/dashboard/pubsets" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Pubsets
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">Error loading pubsets: {error}</div>
        <Link href="/dashboard/pubsets" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Pubsets
        </Link>
      </div>
    );
  }

  if (pubsets === null) {
    return (
      <div className="container mx-auto flex items-center justify-center p-12 text-gray-600">
        <Loader2 className="mr-3 h-6 w-6 animate-spin text-blue-600" />
        Loading selected pubsets…
      </div>
    );
  }

  if (pubsets.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-4 text-2xl font-bold text-red-600">No Valid Pubsets Found</h1>
        <p>The selected pubsets could not be loaded, have no data, or you don&apos;t have access.</p>
        <Link href="/dashboard/pubsets" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Pubsets
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard/pubsets" className="text-blue-600 hover:underline">
          ← Back to Pubsets
        </Link>
        <h1 className="mb-2 mt-3 text-3xl font-bold">Dashboard Data Source Review</h1>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="mb-2 font-medium text-green-900">Review your consolidated data before saving</p>
          <p className="text-sm text-green-800">
            Preview of the combined data from {pubsets.length} pubset{pubsets.length !== 1 ? "s" : ""}. The preview shows{" "}
            {filteredData.length} Portfolio/Project items. When saved, the source includes all {allData.length} items across all
            hierarchy levels.
          </p>
        </div>
      </div>

      <IncludedPubsetsSection pubsets={pubsets} consolidatedData={allData} />

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Portfolio and Project Items ({filteredData.length})</h2>
        <p className="text-sm text-gray-600">Filtered to items where Type = Portfolio or Project.</p>
      </div>

      <ItemsTable data={filteredData} />
    </div>
  );
}

export default function ConsolidatedReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex items-center justify-center p-12 text-gray-600">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-blue-600" />
          Loading…
        </div>
      }
    >
      <ConsolidatedReview />
    </Suspense>
  );
}
