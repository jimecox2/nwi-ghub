"use client";

// Resource Usage Charts — utilization (hours) from tbrescalcs2 (after preprocessing).
import { BarChart3 } from "lucide-react";
import ReportShell from "@/components/dashboard/ReportShell";
import ResourceUsageChart from "@/components/dashboard/charts/ResourceUsageChart";
import { resourceGuard } from "@/components/dashboard/charts/ResourceNotice";

const FIELDS = [
  { fieldName: "tbName", fieldLabel: "Resource Name" },
  { fieldName: "tbL2", fieldLabel: "Project (L2)" },
  { fieldName: "tbMDPrimaryRole", fieldLabel: "Resource Role" },
  { fieldName: "tbMDPrimarySkill", fieldLabel: "Primary Skill" },
  { fieldName: "tbMDLocation", fieldLabel: "Resource Location" },
  { fieldName: "tbMDDepartment", fieldLabel: "Department" },
];

export default function UsageChartsPage() {
  return (
    <ReportShell
      title="Resource Usage Charts"
      icon={BarChart3}
      subtitle="Resource utilization by name, project, role, skill, location, and department."
    >
      {({ dashboardSource, adaptedData }) => {
        const guard = resourceGuard(dashboardSource, adaptedData);
        if (guard) return guard;
        const resCalcs = adaptedData.resCalcs;
        return (
          <div className="space-y-6">
            {FIELDS.map((f) => (
              <ResourceUsageChart key={f.fieldName} data={resCalcs} fieldName={f.fieldName} fieldLabel={f.fieldLabel} />
            ))}
          </div>
        );
      }}
    </ReportShell>
  );
}
