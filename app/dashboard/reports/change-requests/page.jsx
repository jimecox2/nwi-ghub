"use client";

// Change Requests — tbmdjoined rows where tbSubType === 'Change Request'.
import { FilePenLine } from "lucide-react";
import ReportShell from "@/components/dashboard/ReportShell";
import ReportDataTable from "@/components/dashboard/ReportDataTable";

export default function ChangeRequestsReportPage() {
  return (
    <ReportShell title="Change Requests" icon={FilePenLine}>
      {({ dashboardSource }) => {
        const rows = (dashboardSource.tbmdjoined || []).filter((r) => r.tbSubType === "Change Request");
        const status = (r) => (r.tbMDStatus || "").toLowerCase();
        const approved = rows.filter((r) => status(r).includes("approved")).length;
        const pending = rows.filter((r) => status(r).includes("pending") || status(r).includes("open")).length;
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded bg-violet-50 px-3 py-1 font-medium text-violet-800">{rows.length} change requests</span>
              {approved > 0 && (
                <span className="rounded bg-green-50 px-3 py-1 font-medium text-green-800">{approved} approved</span>
              )}
              {pending > 0 && (
                <span className="rounded bg-amber-50 px-3 py-1 font-medium text-amber-800">{pending} pending</span>
              )}
            </div>
            <ReportDataTable data={rows} reportType="risk" filename="change-requests.csv" />
          </div>
        );
      }}
    </ReportShell>
  );
}
