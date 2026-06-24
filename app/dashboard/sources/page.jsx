"use client";

// Manage Sources. The selector owns the source list (fetch/switch/share/delete
// via the API proxy) and reports the active source up; the content component
// renders that source's data. AuthGuard is applied by the dashboard layout.
import { useState } from "react";
import DashboardSourceSelector from "@/components/dashboard/DashboardSourceSelector";
import EnterpriseDashboardContent from "@/components/dashboard/EnterpriseDashboardContent";

export default function SourcesPage() {
  const [activeSource, setActiveSource] = useState(null);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <DashboardSourceSelector onActiveChange={setActiveSource} />
      <EnterpriseDashboardContent source={activeSource} />
    </div>
  );
}
