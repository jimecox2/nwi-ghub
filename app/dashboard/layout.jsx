"use client";

import AuthGuard from "@/components/AuthGuard";
import DashboardNav from "@/components/DashboardNav";

// Standalone app shell for everything under /dashboard. SiteChrome hides the
// marketing TopNav here, so this layout supplies its own header. AuthGuard at
// this level protects the whole subtree, so individual dashboard pages don't
// need to wrap themselves.
export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
