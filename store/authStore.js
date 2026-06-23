import { create } from "zustand";

// Auth state lives in React memory only — no cookies, no localStorage.
// A full page refresh clears this store (and logs the user out) by design.
export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  // Called after a successful login/register/change-password.
  setAuth: ({ token, user }) =>
    set({ token, user, isAuthenticated: Boolean(token) }),

  logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));
