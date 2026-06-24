"use client";

// Executive Dashboard — high-level stats from the active dashboard source.
// Ported from migration-staging/_components/ExecutiveDashboard.jsx; adapted to
// the cookie-auth hook (no jwt/userEmail props) and the auth store for role
// gating. The stats math is unchanged. Resolving/activating the source is the
// hook's job, so this component is presentational.
import Link from "next/link";
import { useMemo } from "react";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnterpriseDashboardSource } from "@/hooks/useEnterpriseDashboardSource";
import { useAuthStore } from "@/store/authStore";
import { canManageDashboardSources } from "@/lib/auth/rbac";

function computeStats(source) {
  const projects = source.tbmdjoined || [];
  const portfolios = projects.filter((p) => p.tbType === "Portfolio");
  const projectsOnly = projects.filter((p) => p.tbType === "Project");

  const num = (v) => parseFloat(v) || 0;
  const totalCost = projects.reduce((s, p) => s + num(p.tbCost), 0);
  const totalBudget = projects.reduce((s, p) => s + num(p.tbBudget), 0);
  const totalWork = projects.reduce((s, p) => s + num(p.tbWork), 0);
  const totalBaselineWork = projects.reduce((s, p) => s + num(p.tbBaselineWork), 0);

  const maxBy = (arr, field) =>
    arr.reduce((max, p) => (num(p[field]) > num(max?.[field]) ? p : max), arr[0] || {});

  const mostExpensivePortfolio = maxBy(portfolios, "tbCost");
  const mostExpensiveProject = maxBy(projectsOnly, "tbCost");
  const mostWorkProject = maxBy(projectsOnly, "tbWork");
  const latestProject = projectsOnly.reduce((latest, p) => {
    return new Date(p.tbStart || 0) > new Date(latest?.tbStart || 0) ? p : latest;
  }, projectsOnly[0] || {});

  const statusCounts = {};
  projectsOnly.forEach((p) => {
    const status = p.tbMDStatus || "Unknown";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const highRiskCount = projects.filter((p) => (p.tbRisk || "").toLowerCase() === "high").length;
  const mediumRiskCount = projects.filter((p) => (p.tbRisk || "").toLowerCase() === "medium").length;
  const openIssuesCount = projects.reduce((s, p) => s + (parseInt(p.tbIssuesOpen) || 0), 0);

  const scheduleVariance = totalBaselineWork ? ((totalWork - totalBaselineWork) / totalBaselineWork) * 100 : 0;
  const budgetVariance = totalBudget ? ((totalCost - totalBudget) / totalBudget) * 100 : 0;

  return {
    totalPortfolios: portfolios.length,
    totalProjects: projectsOnly.length,
    totalCost,
    totalBudget,
    budgetVariance,
    totalWork,
    totalBaselineWork,
    scheduleVariance,
    mostExpensivePortfolio,
    mostExpensiveProject,
    latestProject,
    mostWorkProject,
    statusCounts,
    highRiskCount,
    mediumRiskCount,
    openIssuesCount,
    completedProjects: statusCounts["Completed"] || 0,
    inProgressProjects: statusCounts["In progress"] || 0,
  };
}

const PRODUCT_BADGE = {
  Agilebars: "bg-purple-100 text-purple-800",
  Timebars: "bg-blue-100 text-blue-800",
  Costbars: "bg-orange-100 text-orange-800",
};

export default function ExecutiveDashboard() {
  // Stats use tbmdjoined directly — no need to auto-preprocess tbrescalcs2 here.
  const { dashboardSource, isLoading } = useEnterpriseDashboardSource({ autoPreprocess: false });
  const user = useAuthStore((s) => s.user);
  const canCreate = canManageDashboardSources(user);

  const stats = useMemo(() => (dashboardSource ? computeStats(dashboardSource) : null), [dashboardSource]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading dashboard…</span>
      </div>
    );
  }

  if (!dashboardSource) {
    return canCreate ? (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">No Dashboard Sources Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700">
            Dashboard sources combine published project pubsets into a single view for enterprise reporting. Create your first
            source from the{" "}
            <Link href="/dashboard/pubsets" className="font-medium underline hover:text-yellow-900">
              Make Sources page
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    ) : (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="h-5 w-5" />
            No Dashboard Sources Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700">
            You don&apos;t have access to any dashboard sources yet. Ask your Administrator or Project Manager to share one with you;
            reports will then be available automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  const onTrack = Math.max(0, stats.totalProjects - stats.highRiskCount - stats.mediumRiskCount);

  return (
    <div className="space-y-6">
      {/* Active source banner */}
      <Card className="border-green-500 bg-green-50">
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Active Dashboard Source</h3>
            <Link href="/dashboard/sources" className="ml-auto flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-900">
              <Database className="h-4 w-4" />
              Change Source
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-lg border border-green-200 bg-white p-4">
            <p className="text-xl font-bold text-gray-900">{dashboardSource.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>{dashboardSource.tbmdjoined?.length || 0} items</span>
              {dashboardSource.source_product && (
                <span className={`rounded px-2 py-1 text-xs font-medium ${PRODUCT_BADGE[dashboardSource.source_product] || "bg-gray-100 text-gray-800"}`}>
                  {dashboardSource.source_product}
                </span>
              )}
              <span>Owner: {dashboardSource.owner}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Portfolios" icon={<BarChart3 className="h-4 w-4 text-blue-600" />} value={stats.totalPortfolios} />
        <StatCard
          title="Total Projects"
          icon={<BarChart3 className="h-4 w-4 text-green-600" />}
          value={stats.totalProjects}
          sub={`${stats.inProgressProjects} in progress, ${stats.completedProjects} completed`}
        />
        <StatCard
          title="Total Cost"
          icon={<DollarSign className="h-4 w-4 text-orange-600" />}
          value={`$${(stats.totalCost || 0).toLocaleString()}`}
          variance={stats.budgetVariance}
          varianceLabel={`${Math.abs(stats.budgetVariance).toFixed(1)}% ${stats.budgetVariance > 0 ? "over" : "under"} budget`}
        />
        <StatCard
          title="Total Work Hours"
          icon={<Clock className="h-4 w-4 text-purple-600" />}
          value={`${(stats.totalWork || 0).toLocaleString()}h`}
          variance={stats.scheduleVariance}
          varianceLabel={`${Math.abs(stats.scheduleVariance).toFixed(1)}% variance`}
        />
      </div>

      {/* Risk & issues */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="High Risk Items" icon={<AlertTriangle className="h-4 w-4 text-red-600" />} value={stats.highRiskCount} valueClass="text-red-600" sub={`${stats.mediumRiskCount} medium risk`} />
        <StatCard title="Open Issues" icon={<AlertTriangle className="h-4 w-4 text-orange-600" />} value={stats.openIssuesCount} valueClass="text-orange-600" />
        <StatCard
          title="On Track Projects"
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
          value={onTrack}
          valueClass="text-green-600"
          sub={stats.totalProjects ? `${((onTrack / stats.totalProjects) * 100).toFixed(0)}% success rate` : null}
        />
      </div>

      {/* Top items */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopItem title="Most Expensive Portfolio" item={stats.mostExpensivePortfolio} metric={`$${(parseFloat(stats.mostExpensivePortfolio?.tbCost) || 0).toLocaleString()}`} metricClass="text-orange-600" empty="No portfolios found" />
        <TopItem title="Most Expensive Project" item={stats.mostExpensiveProject} metric={`$${(parseFloat(stats.mostExpensiveProject?.tbCost) || 0).toLocaleString()}`} metricClass="text-orange-600" empty="No projects found" />
        <TopItem
          title="Latest Project"
          titleIcon={<Calendar className="h-4 w-4" />}
          item={stats.latestProject}
          metric={stats.latestProject?.tbStart ? `Start: ${new Date(stats.latestProject.tbStart).toLocaleDateString()}` : "Start: N/A"}
          metricClass="text-gray-600 text-sm font-normal"
          empty="No projects found"
        />
        <TopItem title="Highest Work Hours" titleIcon={<Clock className="h-4 w-4" />} item={stats.mostWorkProject} metric={`${(parseFloat(stats.mostWorkProject?.tbWork) || 0).toLocaleString()}h`} metricClass="text-purple-600" empty="No projects found" />
      </div>

      {/* Status distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-600">{status}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, icon, value, valueClass = "", sub, variance, varianceLabel }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
        {varianceLabel != null && (
          <p className={`mt-1 flex items-center gap-1 text-xs ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
            {variance > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {varianceLabel}
          </p>
        )}
        {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function TopItem({ title, titleIcon, item, metric, metricClass = "", empty }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {titleIcon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {item?.tbName ? (
          <div>
            <p className="text-lg font-medium">{item.tbName}</p>
            <p className={`mt-2 text-2xl font-bold ${metricClass}`}>{metric}</p>
            <p className="mt-1 text-sm text-gray-500">{item.tbMDStatus || "Status unknown"}</p>
          </div>
        ) : (
          <p className="text-gray-500">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}
