"use client";

// Variance Report — Portfolio/Project rows with baseline (bl*) vs actual fields.
import { GitCompare } from "lucide-react";
import ReportShell from "@/components/dashboard/ReportShell";
import ReportDataTable from "@/components/dashboard/ReportDataTable";

export default function VarianceReportPage() {
  return (
    <ReportShell
      title="Variance Report"
      icon={GitCompare}
      subtitle="Current vs. baseline (bl*) schedule and cost. Variance fields are embedded per row."
    >
      {({ adaptedData }) => {
        const rows = (adaptedData?.allRows || []).filter(
          (r) => r.tbType === "Portfolio" || r.tbType === "Project"
        );
        return <ReportDataTable data={rows} reportType="variance" filename="variance.csv" />;
      }}
    </ReportShell>
  );
}
