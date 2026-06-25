"use client";

// Risk Register — tbmdjoined rows where tbSubType === 'Risk'.
import { ShieldAlert } from "lucide-react";
import ReportShell from "@/components/dashboard/ReportShell";
import ReportDataTable from "@/components/dashboard/ReportDataTable";

export default function RisksReportPage() {
  return (
    <ReportShell title="Risk Register" icon={ShieldAlert}>
      {({ dashboardSource }) => {
        const rows = (dashboardSource.tbmdjoined || []).filter((r) => r.tbSubType === "Risk");
        const escalated = rows.filter(
          (r) => r.tbMDEscalationLevel && r.tbMDEscalationLevel !== "N/A" && r.tbMDEscalationLevel !== ""
        ).length;
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded bg-red-50 px-3 py-1 font-medium text-red-800">{rows.length} risks</span>
              {escalated > 0 && (
                <span className="rounded bg-amber-50 px-3 py-1 font-medium text-amber-800">{escalated} escalated</span>
              )}
            </div>
            <ReportDataTable data={rows} reportType="risk" filename="risk-register.csv" />
          </div>
        );
      }}
    </ReportShell>
  );
}
