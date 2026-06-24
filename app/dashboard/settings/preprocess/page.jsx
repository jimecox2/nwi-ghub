"use client";

// Preprocess Resource Data. Extracts Allocation rows from the active dashboard
// source into tbrescalcs2 (via the API proxy). Ported from the legacy page;
// uses the cookie-auth hook + proxy instead of next-auth + direct CRUD.
import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Loader2, Database, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEnterpriseDashboardSource } from "@/hooks/useEnterpriseDashboardSource";
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
} from "@/components/dashboard/EnterprisePageStates";

export default function PreprocessPage() {
  // Don't auto-preprocess here — this page is the manual trigger.
  const { dashboardSource, status, isLoading } = useEnterpriseDashboardSource({ autoPreprocess: false });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  if (isLoading) {
    return <EnterpriseLoading title="Preprocess Resource Data" icon={RefreshCw} message="Loading dashboard source..." />;
  }
  if (status === "unauthenticated") {
    return <EnterpriseUnauthenticated reportName="preprocessing" />;
  }
  if (!dashboardSource) {
    return <EnterpriseNoSource title="Preprocess Resource Data" icon={RefreshCw} />;
  }

  const hasResCalcs = Array.isArray(dashboardSource.tbrescalcs2) && dashboardSource.tbrescalcs2.length > 0;
  const allocationCount = Array.isArray(dashboardSource.tbmdjoined)
    ? dashboardSource.tbmdjoined.filter((r) => r.tbType === "Allocation").length
    : 0;

  const handlePreprocess = async () => {
    setIsProcessing(true);
    setResult(null);
    try {
      const res = await fetch(`/api/dashboard/sources/${dashboardSource.id}/preprocess`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: `Error: ${err.message}`, resCalcsCount: 0 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
          <RefreshCw className="h-8 w-8 text-blue-600" />
          Preprocess Resource Data
        </h1>
        <p className="text-gray-600">
          Extract and reshape Allocation rows from your dashboard source for the resource visualization charts.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-blue-600" />
            Active Dashboard Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Source Name</p>
              <p className="font-semibold">{dashboardSource.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Source Product</p>
              <p className="font-semibold">{dashboardSource.source_product || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items in tbmdjoined</p>
              <p className="font-semibold">{dashboardSource.tbmdjoined?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Allocation Rows (source for preprocessing)</p>
              <p className={`font-semibold ${allocationCount > 0 ? "text-green-700" : "text-amber-600"}`}>
                {allocationCount > 0 ? `${allocationCount} rows available` : "None found"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Data Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {hasResCalcs ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <p className="font-medium">Resource Calculations (tbrescalcs2)</p>
              <p className="text-sm text-gray-500">
                {hasResCalcs
                  ? `${dashboardSource.tbrescalcs2.length} resource calculation records available`
                  : "Not yet preprocessed — run preprocessing to populate"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="mb-1 font-semibold">What does preprocessing do?</p>
              <p>
                Preprocessing extracts Allocation rows from tbmdjoined and reshapes them into the resource calculation format
                (tbrescalcs2) used by the cost charts, usage charts, and other resource visualization reports. Run it after creating
                or updating a dashboard source.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Button onClick={handlePreprocess} disabled={isProcessing} className="px-6 py-3">
              {isProcessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" />{hasResCalcs ? "Re-run Preprocessing" : "Run Preprocessing"}</>
              )}
            </Button>
            {hasResCalcs && (
              <p className="text-sm text-gray-500">Re-running replaces existing preprocessed data with a fresh extraction.</p>
            )}
          </div>

          {result && (
            <div className={`mt-4 rounded-lg border p-4 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${result.success ? "text-green-900" : "text-red-900"}`}>
                    {result.success ? "Preprocessing Complete" : "Preprocessing Failed"}
                  </p>
                  <p className={`mt-1 text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
