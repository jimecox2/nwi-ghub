"use client";

import { useAuth } from "@/hooks/useAuth";

// Reusable wrapper for protected pages. Shows a brief fallback until the auth
// store is hydrated (AuthProvider calls /api/auth/me), then renders children
// only when authenticated; otherwise useAuth redirects to /login.
export default function AuthGuard({ children, redirectTo = "/login" }) {
  const { isAuthenticated, hydrated } = useAuth({ redirectTo, required: true });

  if (!hydrated) {
    return <div className="py-16 text-center text-gray-500">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center text-gray-500">
        Redirecting to login…
      </div>
    );
  }

  return children;
}
