# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site + member area for Northern Wireless Inc. Content pages are MDX;
the member area is a Strapi-backed authentication system. Migrated from a legacy
classic-ASP site (see README.md for the content-migration background).

## Commands

- **Dev:** `npm run dev` → http://localhost:3012 (Turbopack)
- **Build:** `npm run build` (Turbopack, produces `.next/standalone`)
- **Start (prod):** `npm run start` → port 3012
- **Lint:** `npm run lint`
- No test suite exists.

Builds/dev need `STRAPI_URL` in the environment (`.env.local`, copied from
`.env.example`). To verify auth wiring during a build:
`STRAPI_URL=https://be2.timebars.com npm run build`.

## Toolchain (hard requirements)

- **Node ≥ 20.9** (see `.nvmrc` = 20). Next 16 will not run on Node 18.
- **Next.js 16 + React 19**, Turbopack is the default bundler.
- **JavaScript only — no TypeScript.** Files use `.js`/`.jsx`.
- `@/*` path alias maps to the repo root (`jsconfig.json`).

## Architecture

**Routing:** App Router with `@next/mdx`. Each `app/**/page.mdx` is its own route
(no data layer); interactive pages are `page.jsx`. `pageExtensions` in
`next.config.mjs` enables both. `mdx-components.jsx` at the root is required by
`@next/mdx`. Nav is data-driven from `lib/nav.js` (rendered by
`components/TopNav.jsx`).

**Auth model (read this before touching auth):** plain `fetch` + JWT against
Strapi's Users & Permissions plugin — no Auth.js/NextAuth, no auth libraries.
The JWT lives in an **httpOnly cookie** (`nwi_jwt`), set and cleared server-side.

- **The raw token never reaches the browser.** Login/register/change-password/
  logout go through `app/api/auth/*` route handlers that call Strapi
  (`lib/auth.js`) and set/clear the cookie via `lib/authCookies.js` (server-only,
  uses async `cookies()`). The shared cookie name lives in `lib/authConstants.js`.
- **Zustand (`store/authStore.js`) holds only the non-sensitive `user`** plus
  `isAuthenticated` and a `hydrated` flag: `{ user, isAuthenticated, hydrated,
  setUser, setHydrated, logout }`. `components/AuthProvider.jsx` (mounted at the
  root) hydrates it on load by calling `/api/auth/me`. **A page refresh keeps
  the session** (the cookie persists) — this supersedes the old in-memory model.
- **Route protection is real and server-side.** `proxy.js` redirects to `/login`
  when the cookie is absent on `/dashboard/*`. `components/AuthGuard.jsx`
  (via `hooks/useAuth.js`) is the client-side complement: it waits for hydration,
  then redirects if not authenticated.
- **Authenticated data fetching is server-side.** Server components and route
  handlers read the token from the cookie (`getAuthToken()` in
  `lib/authCookies.js`). Privileged Strapi writes go through `app/api/dashboard/*`
  routes (server-only admin token), not the browser. `lib/serverAuth.js`
  (`node:crypto` + `STRAPI_JWT_SECRET`) powers `app/api/auth/verify`; never import
  it from a client component.

**Routes:** public = `/` + all marketing MDX pages, `/login`, `/register`.
Protected (AuthGuard) = `/dashboard`, `/dashboard/change-password`.

## Environment variables

- `STRAPI_URL` — **bare origin, no `/api`, no trailing slash** (code appends
  `/api/...`). Exposed to the browser via the `env` mapping in `next.config.mjs`,
  so it is **inlined at build time**. In Docker it is a **build arg**.
- `STRAPI_JWT_SECRET` — **server-only**, read at runtime. Never mapped into the
  client bundle; in Docker it is a **runtime** `-e` var, never baked.
- `FULL_ACCESS_ADMIN_TOKEN` — **server-only** Strapi API token. Used by the
  dashboard API proxy (`app/api/dashboard/*`) for privileged writes after
  server-side RBAC. Never exposed to the browser; Docker **runtime** `-e` var.

## Strapi dependency

Backend is Strapi Users & Permissions (`STRAPI_SETUP.md` has the full config).
Key gotchas:
- Public role needs `register` + `callback`; Authenticated role needs
  `changePassword` + `me`.
- **Email confirmation is ON.** Register returns no JWT; `/register` shows a
  "check your email" screen instead of logging in. If confirmation is on but no
  mail provider is configured, register returns `400 ApplicationError
  "Unauthorized"` (the provider's auth error) even though the user row is created.

## Docker

Standalone image (`output: "standalone"`), `node:20-alpine`, port 3012, non-root.
Build bakes `STRAPI_URL`; runtime supplies `STRAPI_JWT_SECRET`:

```bash
docker build --build-arg STRAPI_URL=https://be2.timebars.com -t jimecox807/nwi:latest .
docker run -p 3012:3012 -e STRAPI_JWT_SECRET=... jimecox807/nwi:latest
```

`deploy-push-to-hub-secure.sh` wraps build+push and passes the build arg.

## Conventions

- Match the surrounding code: client components start with `"use client"`;
  Tailwind utility classes (navy palette `#062f57`/`#0b4d8e`/`#2b8fd9`); forms
  use local `useState` + the `lib/auth.js` helpers.
- Strapi's `identifier` field on login accepts email or username.
