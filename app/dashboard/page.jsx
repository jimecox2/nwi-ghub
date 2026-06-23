"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

// AuthGuard is applied by app/dashboard/layout.jsx for the whole subtree.
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome{user?.username ? `, ${user.username}` : ""}. You are signed in
        as <strong>{user?.email}</strong>.
      </p>

      <p className="mt-6 text-sm text-gray-600">
        Use the navigation above to open a report. New report pages are being
        rolled out one at a time.{" "}
        <Link href="/dashboard/change-password" className="text-blue-600 hover:text-blue-800 hover:underline">
          Change your password
        </Link>
        .
      </p>
    </div>
  );
}
