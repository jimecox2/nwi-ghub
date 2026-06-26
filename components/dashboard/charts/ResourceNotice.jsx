"use client";

// Amber notice used by the resource reports when data isn't available
// (Agilebars source, no Allocation rows, or not yet preprocessed).
import { AlertTriangle } from "lucide-react";

export default function ResourceNotice({ title, children }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
        <div>
          <p className="mb-2 font-semibold text-amber-900">{title}</p>
          <div className="space-y-2 text-sm text-amber-800">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Shared guard: returns a notice element if resource charts can't render, else
// null. Pass the dashboardSource + adaptedData from ReportShell.
export function resourceGuard(dashboardSource, adaptedData) {
  const agilebars = (dashboardSource?.tbdocuments || []).filter((p) => p.source_product === "Agilebars");
  if (agilebars.length > 0) {
    return (
      <ResourceNotice title="Resource Reports Not Available for Agilebars">
        <p>
          This source includes Agilebars pubset{agilebars.length > 1 ? "s" : ""}:{" "}
          <span className="font-medium">{agilebars.map((p) => p.name).join(", ")}</span>. Agilebars uses task data
          directly, not the resource pool. Resource analysis requires Timebars or Costbars schedules.
        </p>
      </ResourceNotice>
    );
  }

  const allRows = adaptedData?.allRows || [];
  if (allRows.filter((r) => r.tbType === "Allocation").length === 0) {
    return (
      <ResourceNotice title="No Resource Allocations Found">
        <p>
          This source contains no Allocation rows. Resource charts require tasks with resource allocations in your
          Timebars or Costbars schedules.
        </p>
      </ResourceNotice>
    );
  }

  const resCalcs = adaptedData?.resCalcs || [];
  if (resCalcs.length === 0) {
    return (
      <ResourceNotice title="Resource Calculation Data Not Available">
        <p>
          Resource data hasn&apos;t been preprocessed for this source yet. Run{" "}
          <a href="/dashboard/settings/preprocess" className="font-medium underline hover:text-amber-900">
            Preprocess Resource Data
          </a>{" "}
          from the Settings menu.
        </p>
      </ResourceNotice>
    );
  }

  return null;
}
