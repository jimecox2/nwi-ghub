"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

// Hydrates the auth store on app load by calling /api/auth/me, which reads the
// httpOnly cookie server-side. This makes auth refresh-safe: a page reload no
// longer logs the user out. Mounted once near the root.
export default function AuthProvider({ children }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (active) setUser(data.user || null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [setUser, setHydrated]);

  return children;
}
