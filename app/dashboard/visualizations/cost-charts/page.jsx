"use client";

// Resource Cost Charts — cost distribution from tbrescalcs2 (after preprocessing).
import { PieChart } from "lucide-react";
import ReportShell from "@/components/dashboard/ReportShell";
import ResourceCostUsagePie from "@/components/dashboard/charts/ResourceCostUsagePie";
import IndicatorCards from "@/components/dashboard/charts/IndicatorCards";
import { resourceGuard } from "@/components/dashboard/charts/ResourceNotice";

const FIELDS = [
  { fieldName: "tbL2", fieldLabel: "Project (L2)" },
  { fieldName: "tbMDPrimaryRole", fieldLabel: "Resource Role" },
  { fieldName: "tbMDLocation", fieldLabel: "Resource Location" },
  { fieldName: "tbMDDepartment", fieldLabel: "Department" },
];

function buildIndicatorRows(resCalcs) {
  const fields = {
    tbL2: "Project",
    tbName: "Resource Name",
    tbMDLocation: "Location",
    tbMDDepartment: "Department",
    tbMDPrimaryRole: "Role",
    tbMDPrimarySkill: "Skill",
  };
  const totals = {};
  for (const row of resCalcs) {
    for (const f of Object.keys(fields)) {
      const v = row[f] || "Unknown";
      totals[`${f}|${v}`] = (totals[`${f}|${v}`] || 0) + (Number(row.tbResCalcCost) || 0);
    }
  }
  return Object.entries(totals).map(([k, cost]) => {
    const [fieldName, fieldValue] = k.split("|");
    return { value: Math.round(cost), unit: "Cost", label: fields[fieldName], fieldName, fieldValue };
  });
}

export default function CostChartsPage() {
  return (
    <ReportShell
      title="Resource Cost Charts"
      icon={PieChart}
      subtitle="Cost distribution across projects, roles, locations, and departments."
    >
      {({ dashboardSource, adaptedData }) => {
        const guard = resourceGuard(dashboardSource, adaptedData);
        if (guard) return guard;
        const resCalcs = adaptedData.resCalcs;
        return (
          <div className="space-y-6">
            <IndicatorCards currentRows={buildIndicatorRows(resCalcs)} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {FIELDS.map((f) => (
                <ResourceCostUsagePie key={f.fieldName} data={resCalcs} fieldName={f.fieldName} fieldLabel={f.fieldLabel} metric="cost" />
              ))}
            </div>
          </div>
        );
      }}
    </ReportShell>
  );
}
