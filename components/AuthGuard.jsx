"use client";

import { useAuth } from "@/hooks/useAuth";

// Reusable wrapper for protected pages. Renders children only when a token is
// present; otherwise useAuth redirects to /login and we show a brief fallback.
export default function AuthGuard({ children, redirectTo = "/login" }) {
  const { token } = useAuth({ redirectTo, required: true });

  if (!token) {
    return (
      <div className="py-16 text-center text-gray-500">
        Redirecting to login…
      </div>
    );
  }

  return children;
}
