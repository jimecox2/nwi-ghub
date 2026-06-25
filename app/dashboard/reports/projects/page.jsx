"use client";

// Project Status Report — Portfolio/Project rows from the active source.
import { FileText } from "lucide-react";
import ReportShell from "@/components/dashboard/ReportShell";
import ReportDataTable from "@/components/dashboard/ReportDataTable";

export default function ProjectReportsPage() {
  return (
    <ReportShell title="Project Status Report" icon={FileText}>
      {({ dashboardSource }) => {
        const rows = (dashboardSource.tbmdjoined || []).filter(
          (r) => r.tbType === "Portfolio" || r.tbType === "Project"
        );
        return <ReportDataTable data={rows} reportType="default" filename="project-status.csv" />;
      }}
    </ReportShell>
  );
}
