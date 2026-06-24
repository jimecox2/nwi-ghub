"use client";

// Shared hook for enterprise pages: resolves the active dashboard source via the
// API proxy and adapts it into the common report shape. Rewritten from the
// legacy next-auth + coreCrud version to use the cookie-auth proxy.
//
// Auto-preprocesses tbrescalcs2 on first load when missing, then refetches.
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { adaptDashboardSourceData } from "@/lib/dashboard/adapter";

async function fetchSources() {
  const res = await fetch("/api/dashboard/sources");
  if (!res.ok) throw new Error("Failed to load dashboard sources");
  const data = await res.json();
  return data.sources || [];
}

export function useEnterpriseDashboardSource({ autoPreprocess = true } = {}) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [dashboardSource, setDashboardSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreprocessing, setIsPreprocessing] = useState(false);
  const [error, setError] = useState(null);
  const preprocessAttempted = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sources = await fetchSources();
        const found = sources.find((s) => s.isActive) || (sources.length > 0 ? sources[0] : null);
        if (!active) return;
        setDashboardSource(found);

        const missingResCalcs =
          found && (!Array.isArray(found.tbrescalcs2) || found.tbrescalcs2.length === 0);

        if (autoPreprocess && found && !preprocessAttempted.current && missingResCalcs) {
          preprocessAttempted.current = true;
          setIsPreprocessing(true);
          try {
            const res = await fetch(`/api/dashboard/sources/${found.id}/preprocess`, { method: "POST" });
            const result = await res.json().catch(() => ({}));
            if (res.ok && result.success && result.resCalcsCount > 0) {
              const refreshed = await fetchSources();
              const updated = refreshed.find((s) => s.id === found.id) || found;
              if (active) setDashboardSource(updated);
            }
          } catch {
            // Non-fatal — the page can still show "not preprocessed".
          } finally {
            if (active) setIsPreprocessing(false);
          }
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [hydrated, user, autoPreprocess]);

  const adaptedData = dashboardSource ? adaptDashboardSourceData(dashboardSource) : null;
  const status = !hydrated ? "loading" : user ? "authenticated" : "unauthenticated";

  return {
    dashboardSource,
    adaptedData,
    user,
    status,
    isLoading: !hydrated || isLoading,
    isPreprocessing,
    error,
  };
}
