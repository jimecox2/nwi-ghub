Here's your Claude Code prompt:

---

**PROMPT:**

I have a Next.js app using the App Router connected to this GitHub repository. It has a nav and a few pages. I want to add a complete authentication system using Strapi's built-in Users & Permissions plugin as the backend.

**Before writing any code:**

1. Review the existing project structure and list:
   - All existing pages and routes
   - Current nav component
   - Existing `.env` files
   - Current middleware if any
   - Package.json dependencies

2. Produce a **implementation plan** listing every file that will be created or modified before touching anything. Wait for my approval before proceeding.

**Requirements:**

**Environment**
- Add `STRAPI_URL=https://your-strapi-url.com` placeholder to `.env.local`
- Add `STRAPI_JWT_SECRET=your-jwt-secret` placeholder to `.env.local`
- Add both to `.env.example`

**Auth flow**
- create an account in Strapi with minimal data collection only user name, email address and password generation and storage per Strapi api.
- Login via `POST ${STRAPI_URL}/api/auth/local` (Strapi endpoint)
- Strapi returns a JWT — store it in React state only, no cookies, no localStorage
- Use Zustand to hold auth state: `{ token, user, isAuthenticated }`
- All authenticated API calls pass `Authorization: Bearer <token>` header


**Pages to create or modify**
- existing - `/` landing page — public, no auth required
- `/login` — public, login form (email + password), redirects to `/dashboard` on success, show error on failure
- new -`/dashboard` and any other non-landing pages — protected, redirect to `/login` if not authenticated
- Update existing nav to show Login button when logged out, user email + Logout button when logged in.
- Using Strapi api set up a change password process and provide instructions how to configure strapi for this to work.

**Route protection**
- Use Next.js `middleware.ts` to protect all routes except `/` and `/login`
- Middleware checks for a custom request header or falls through to client-side guard
- Add a client-side `useAuth` hook that redirects to `/login` if token is absent — use this in all protected page components as a second layer

**Code standards**
- No TypeScript please
- All auth logic in `lib/auth.ts` — Strapi login call, token verification helper
- Zustand store in `store/authStore.ts`
- Reusable `components/AuthGuard.tsx` wrapper component for protected pages
- No auth libraries (no Auth.js, no NextAuth) — plain fetch + JWT

**After implementing:**
- List every file created or modified
- Show the complete `.env.example`
- Confirm which pages are protected and which are public

---

This gives Claude Code enough structure to plan first, then implement cleanly without guessing at your intent.