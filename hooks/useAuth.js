"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// Client-side auth guard hook. The real token lives in an httpOnly cookie and
// is verified server-side (proxy + /api/auth/me); this hook gates the UI on the
// hydrated store. It waits for hydration before redirecting so an authenticated
// user isn't bounced to /login on the first render.
export function useAuth({ redirectTo = "/login", required = true } = {}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (required && hydrated && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [required, hydrated, isAuthenticated, redirectTo, router]);

  return { user, isAuthenticated, hydrated };
}
