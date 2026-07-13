"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  ChevronDown,
  Database,
  TrendingUp,
  FileText,
  BarChart3,
  PieChart,
  User,
  LogOut,
  Home,
  Building2,
  LayoutDashboard,
  FolderOpen,
  GitCompare,
  Users,
  Layers,
  Activity,
  RefreshCw,
  LineChart,
  ShieldAlert,
  AlertOctagon,
  FilePenLine,
  Briefcase,
  Target,
  CircleDot,
  Scale,
  Gauge,
  DollarSign,
  Grid3X3,
  SlidersHorizontal,
  CalendarRange,
  Network,
  Tag,
} from "lucide-react";

/**
 * Dashboard navigation header.
 * Ported from the legacy EnterpriseHeader: same navy gradient bar, dropdown
 * menus, breadcrumbs, and user menu — but wired to this site's in-memory
 * Zustand auth (no NextAuth, no cookies). `user` comes from the store and
 * "Sign Out" calls the store's logout, matching components/AuthNav.jsx.
 */
export default function DashboardNav() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
    setIsUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    closeDropdowns();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors; clear client state regardless.
    }
    logout();
    router.push("/");
    router.refresh();
  };

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }];

    let currentPath = "";
    paths.slice(1).forEach((path) => {
      currentPath += `/${path}`;
      breadcrumbs.push({
        label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " "),
        href: `/dashboard${currentPath}`,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Display labels for menu categories (handles PPM capitalization)
  const menuLabels = {
    ppm: "PPM",
    project: "Project",
    task: "Task",
    resource: "Resource",
    agile: "Agile",
    other: "Other",
    settings: "Settings",
  };

  // Rendered left-to-right in object-key order: PPM, Project, Task, Resource,
  // Agile, Other, Settings.
  const menuItems = {
    ppm: [
      { label: "Prioritization Matrix", href: "/dashboard/reports/prioritization", icon: Target },
      { label: "Bubble Chart", href: "/dashboard/reports/bubble-chart", icon: CircleDot },
      { label: "Balanced Scorecard", href: "/dashboard/reports/balanced-scorecard", icon: Scale },
      { label: "Financial Summary", href: "/dashboard/reports/financial-summary", icon: DollarSign },
      { label: "Strategic Alignment", href: "/dashboard/reports/strategic-alignment", icon: Grid3X3 },
      { label: "What-If Scenarios", href: "/dashboard/reports/what-if", icon: SlidersHorizontal },
      { label: "Cost Analytics", href: "/dashboard/analytics/cost", icon: LineChart },
    ],
    project: [
      { label: "All Reports", href: "/dashboard/reports", icon: BarChart3 },
      { label: "Project Status", href: "/dashboard/reports/projects", icon: FileText },
      { label: "Portfolio Status", href: "/dashboard/reports/portfolio", icon: PieChart },
      { label: "Variance Report", href: "/dashboard/reports/variance", icon: GitCompare },
      { label: "Risk Register", href: "/dashboard/reports/risks", icon: ShieldAlert },
      { label: "Issues Log", href: "/dashboard/reports/issues", icon: AlertOctagon },
      { label: "Change Requests", href: "/dashboard/reports/change-requests", icon: FilePenLine },
      { label: "Executive Summary", href: "/dashboard/reports/executive-summary", icon: Briefcase },
      { label: "Project Cards", href: "/dashboard/drilldown/cards", icon: Layers },
    ],
    task: [
      { label: "Tasks Tagged with Show In", href: "/dashboard/reports/show-in", icon: Tag },
      { label: "Facility Schedule", href: "/dashboard/facilities", icon: CalendarRange },
    ],
    resource: [
      { label: "Resource Pool", href: "/dashboard/reports/resources", icon: Users },
      { label: "Capacity vs Demand", href: "/dashboard/reports/capacity-demand", icon: Gauge },
      { label: "Resource Cost Charts", href: "/dashboard/visualizations/cost-charts", icon: PieChart },
      { label: "Resource Usage Charts", href: "/dashboard/visualizations/usage-charts", icon: BarChart3 },
    ],
    agile: [
      { label: "Burndown Charts", href: "/dashboard/visualizations/burndown", icon: Activity },
      { label: "Performance Analytics", href: "/dashboard/analytics/performance", icon: TrendingUp },
    ],
    other: [
      { label: "WBS View", href: "/dashboard/other/wbs-view", icon: Network },
    ],
    settings: [
      { label: "Make Sources", href: "/dashboard/pubsets", icon: FolderOpen },
      { label: "Manage Sources", href: "/dashboard/sources", icon: Database },
      { label: "Preprocess Resource Data", href: "/dashboard/settings/preprocess", icon: RefreshCw },
    ],
  };

  return (
    <>
      {/* Blue Gradient Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4">
          {/* Top Bar with Logo, Navigation, and User Profile */}
          <div className="flex items-center justify-between py-3">
            {/* Title */}
            <Link href="/dashboard" className="flex items-center" onClick={closeDropdowns}>
              <div>
                <h1 className="text-xl font-bold">Enterprise Project Dashboard</h1>
                <p className="text-xs text-blue-100">
                  Welcome {user?.email} - Analyze consolidated project data from multiple pubset sources
                </p>
              </div>
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setOpenDropdown(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">{user?.username || user?.email}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.username || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    href="/dashboard/change-password"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={closeDropdowns}
                  >
                    <User className="w-4 h-4" />
                    Change Password
                  </Link>

                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={closeDropdowns}
                  >
                    <Home className="w-4 h-4" />
                    Back to Main Site
                  </Link>

                  <Link
                    href="/intranet"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={closeDropdowns}
                  >
                    <Building2 className="w-4 h-4" />
                    Intranet
                  </Link>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={closeDropdowns}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Dropdowns */}
          <div className="flex items-center gap-1 pb-3 border-t border-blue-800 pt-3">
            {Object.entries(menuItems).map(([key, items]) => (
              <div key={key} className="relative">
                <button
                  onClick={() => toggleDropdown(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    openDropdown === key ? "bg-blue-800" : "hover:bg-blue-800"
                  }`}
                >
                  <span>{menuLabels[key] || key}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === key ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === key && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 py-2">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                          onClick={closeDropdowns}
                        >
                          <Icon className="w-4 h-4 text-blue-600" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <span className="text-gray-400">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(openDropdown || isUserMenuOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeDropdowns} />
      )}
    </>
  );
}
