import { create } from "zustand";

// The JWT now lives in an httpOnly cookie (set/cleared by the /api/auth/*
// route handlers and read server-side). The browser never holds the raw token.
// This store keeps only the non-sensitive `user` for UI, plus a `hydrated` flag
// so guards can tell "not logged in" apart from "haven't checked yet".
//
// `user` is populated on app load by AuthProvider (which calls /api/auth/me)
// and after login/register/change-password.
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  hydrated: false,

  setUser: (user) => set({ user: user || null, isAuthenticated: Boolean(user) }),
  setHydrated: (hydrated = true) => set({ hydrated }),

  // Clears client state only — call POST /api/auth/logout to drop the cookie.
  logout: () => set({ user: null, isAuthenticated: false }),
}));
