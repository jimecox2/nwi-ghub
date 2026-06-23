"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// Client-side auth guard hook. Use it inside protected page components as the
// real enforcement layer (middleware cannot see the in-memory token).
// When `required` and there is no token, it redirects to `redirectTo`.
export function useAuth({ redirectTo = "/login", required = true } = {}) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (required && !token) {
      router.replace(redirectTo);
    }
  }, [required, token, redirectTo, router]);

  return { token, user, isAuthenticated };
}
