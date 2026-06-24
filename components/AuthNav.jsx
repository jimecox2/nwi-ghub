"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// Login/Logout control for the nav. Shows a Login link when logged out, and the
// user's email + a Logout button when logged in. `onNavigate` lets the mobile
// menu close itself when an item is tapped.
export default function AuthNav({ onNavigate }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors; clear client state regardless.
    }
    logout();
    if (onNavigate) onNavigate();
    router.push("/");
    router.refresh();
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="max-w-[12rem] truncate text-[15px] text-white/90">
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md bg-white/15 px-3 py-1.5 text-[15px] font-medium text-white hover:bg-white/25"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      onClick={onNavigate}
      className="rounded-md bg-white/15 px-4 py-1.5 text-[15px] font-medium text-white hover:bg-white/25"
    >
      Login
    </Link>
  );
}
