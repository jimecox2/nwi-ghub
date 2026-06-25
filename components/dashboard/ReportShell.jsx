"use client";

// Shared wrapper for enterprise report pages: resolves the active dashboard
// source via the cookie-auth hook and renders the standard loading / unauth /
// no-source / error states, plus the report header. The page supplies a render
// function that receives { dashboardSource, adaptedData }.
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from "@/components/dashboard/EnterprisePageStates";
import { useEnterpriseDashboardSource } from "@/hooks/useEnterpriseDashboardSource";

export default function ReportShell({ title, icon: Icon, subtitle, autoPreprocess = false, children }) {
  const { dashboardSource, adaptedData, status, isLoading, error } = useEnterpriseDashboardSource({ autoPreprocess });

  if (isLoading) return <EnterpriseLoading title={title} icon={Icon} message="Loading data..." />;
  if (status === "unauthenticated") return <EnterpriseUnauthenticated reportName={title} />;
  if (error) return <EnterpriseError title={title} icon={Icon} error={error} />;
  if (!dashboardSource) return <EnterpriseNoSource title={title} icon={Icon} />;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
          {Icon ? <Icon className="h-8 w-8 text-blue-600" /> : null}
          {title}
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {children({ dashboardSource, adaptedData })}
    </div>
  );
}
