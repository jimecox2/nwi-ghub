"use client";

// Issues Log — tbmdjoined rows where tbSubType === 'Issue'.
import { AlertOctagon } from "lucide-react";
import ReportShell from "@/components/dashboard/ReportShell";
import ReportDataTable from "@/components/dashboard/ReportDataTable";

export default function IssuesReportPage() {
  return (
    <ReportShell title="Issues Log" icon={AlertOctagon}>
      {({ dashboardSource }) => {
        const rows = (dashboardSource.tbmdjoined || []).filter((r) => r.tbSubType === "Issue");
        const escalated = rows.filter(
          (r) => r.tbMDEscalationLevel && r.tbMDEscalationLevel !== "N/A" && r.tbMDEscalationLevel !== ""
        ).length;
        const open = rows.filter((r) => (r.tbMDStatus || "").toLowerCase() !== "closed").length;
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded bg-orange-50 px-3 py-1 font-medium text-orange-800">{rows.length} issues</span>
              <span className="rounded bg-blue-50 px-3 py-1 font-medium text-blue-800">{open} open</span>
              {escalated > 0 && (
                <span className="rounded bg-amber-50 px-3 py-1 font-medium text-amber-800">{escalated} escalated</span>
              )}
            </div>
            <ReportDataTable data={rows} reportType="risk" filename="issues-log.csv" />
          </div>
        );
      }}
    </ReportShell>
  );
}
