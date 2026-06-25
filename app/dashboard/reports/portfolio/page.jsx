"use client";

// Portfolio Report — portfolio-level + project rows from the active source.
import { PieChart } from "lucide-react";
import ReportShell from "@/components/dashboard/ReportShell";
import ReportDataTable from "@/components/dashboard/ReportDataTable";

export default function PortfolioReportPage() {
  return (
    <ReportShell title="Portfolio Report" icon={PieChart}>
      {({ dashboardSource }) => {
        const rows = (dashboardSource.tbmdjoined || []).filter(
          (r) => r.tbType === "Portfolio" || r.tbType === "Project"
        );
        return <ReportDataTable data={rows} reportType="default" filename="portfolio.csv" />;
      }}
    </ReportShell>
  );
}
