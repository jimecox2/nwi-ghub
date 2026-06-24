"use client";

// Enterprise landing page — executive stats from the active dashboard source.
// AuthGuard is applied by app/dashboard/layout.jsx for the whole subtree.
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <ExecutiveDashboard />
    </div>
  );
}
