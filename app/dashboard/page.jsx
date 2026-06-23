"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuthStore } from "@/store/authStore";

function DashboardContent() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Welcome{user?.username ? `, ${user.username}` : ""}. You are signed in
        as <strong>{user?.email}</strong>.
      </p>

      <ul>
        <li>
          <Link href="/dashboard/change-password">Change your password</Link>
        </li>
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
