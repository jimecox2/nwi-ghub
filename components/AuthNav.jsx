"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  ChevronDown,
  User,
  Home,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

// Login/Logout control for the nav. Logged out: a Login link. Logged in: the
// user's email as a dropdown trigger (mirroring the dashboard user menu) with
// quick links back to the Intranet, Home, Proposals and Dashboard, plus Logout.
// `onNavigate` lets the mobile menu close itself when an item is tapped.
const MENU_LINKS = [
  { label: "Intranet", href: "/intranet", icon: Building2 },
  { label: "Home", href: "/", icon: Home },
  { label: "Proposals", href: "/intranet/proposals", icon: FileText },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export default function AuthNav({ onNavigate }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  function handleNavigate() {
    closeMenu();
    if (onNavigate) onNavigate();
  }

  async function handleLogout() {
    closeMenu();
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
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-md bg-white/15 px-3 py-1.5 text-[15px] font-medium text-white hover:bg-white/25"
        >
          <User className="h-4 w-4" />
          <span className="max-w-[12rem] truncate">{user.username || user.email}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <>
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-white py-2 shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{user.username || "User"}</p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>

              {MENU_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={handleNavigate}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                >
                  <Icon className="h-4 w-4 text-blue-600" />
                  {label}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>

            {/* Click outside to close */}
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
          </>
        )}
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
