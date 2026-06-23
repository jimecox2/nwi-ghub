"use client";

import { usePathname } from "next/navigation";
import TopNav from "@/components/TopNav";

// Wraps the app shell. Marketing pages get the navy TopNav, the centered prose
// <main>, and the footer. The dashboard is a standalone app area: it renders
// bare here and supplies its own chrome via app/dashboard/layout.jsx.
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  if (isDashboard) {
    return children;
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <article className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-blue-700">
          {children}
        </article>
      </main>
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Northern Wireless Inc.
      </footer>
    </>
  );
}
