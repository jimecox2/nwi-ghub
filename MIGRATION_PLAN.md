# Dashboard Migration Plan

Plan for porting the old Next.js 14 dashboard pages + components into this
Next.js 16 / React 19 site and adapting them to the in-memory Strapi auth.
This doc is a handoff seed — a new Claude Code session can read this + CLAUDE.md
and continue without re-deriving context.

## Status checklist

- [x] Step 1 — Old files staged (now at top-level `migration-staging/`, moved
      out of `app/` so Next does not compile them as routes)
- [x] Step 2 — Audit done (see "Audit findings" below)
- [ ] Step 3+ — DEFERRED. Decision: keep staged files as **read-only
      reference** and rebuild the dashboard fresh to new requirements in future
      sessions. No wholesale port.

## Audit findings (2026, Next 14 → 16 reference dashboard)

The staged set is **only the top layer** of a much larger app. The 30 staged
files reference modules and packages that were NOT included:

**Missing internal modules (13):** `lib/crud/coreCrud`,
`lib/crud/pubsetDataFetcher` (the whole Strapi data layer — `getUserByEmail`,
`getAllDashboardSources`, `getActiveDashboardSource`, RBAC by `Customer_id`),
`components/ui/card`, `components/ui/table` (shadcn/ui),
`components/Dashboard/Reports/ItemDetailsDataTable`,
`components/Dashboard/Graphs/BurndownChart`,
`components/Dashboard/Charts/ResourceUsageChart`,
`components/Dashboard/Charts/ResourceCostUsagePie`,
`components/Dashboard/Cards/{TabsBelowCardsComponent,IndicatorCards,CollapsibleCardLights}`,
`app/dashboard/_hooks/useEnterpriseDashboardSource` (imported by 18 pages),
`auth/auth` (NextAuth config).

**Missing npm packages (4):** `lucide-react`, `recharts`, `moment`, `next-auth`.

**Auth model is incompatible.** The old dashboard uses **NextAuth server
sessions**: `layout.jsx` / `page.jsx` are `async` server components calling
`await auth()`, reading `session.jwt`, redirecting server-side; report pages use
`useSession()` + `session.jwt` for data calls; the header uses `signOut()`.
This site has **no NextAuth and no cookie** — the token lives in client memory
(Zustand), invisible to server components. Any rebuild must use
`useAuthStore` + `AuthGuard` (client-side) and read the Bearer token from the
store; see CLAUDE.md.

**Data shape (for reference):** dashboard "sources" carry a `tbmdjoined[]` array
of items with fields like `tbType` (Portfolio/Project), `tbCost`, `tbBudget`,
`tbWork`, `tbBaselineWork`, `tbMDStatus`, `tbRisk`, `tbIssuesOpen`, `tbStart`,
`tbName`. RBAC roles seen: Administrator, Project Manager, Executive.

## When rebuilding fresh (recommended next-session prompt)

> Read CLAUDE.md and MIGRATION_PLAN.md. Treat `migration-staging/` as reference
> only. Build a new `/dashboard/<x>` page to <new requirement>, using
> `AuthGuard` + `useAuthStore` for auth and client-side Bearer fetches. Install
> any needed deps (e.g. lucide-react, recharts).

## Working branch

`claude/dreamy-hypatia-pb348t` → PR into `main`, merge. (Workflow so far:
small PRs, build verified before push.)

## Step 1 — Stage the old files (user does this)

My environment only sees committed files, so the old code must be pushed:

```bash
mkdir -p migration-staging
# copy old dashboard routes + components in, preserving structure:
#   migration-staging/<app-or-pages>/dashboard/...
#   migration-staging/components/...
#   migration-staging/lib/...        (any helpers they import)
#   migration-staging/styles/...     (CSS modules / globals they rely on)
git add migration-staging
git commit -m "stage old dashboard for migration"
git push
```

Include everything the pages import (helpers, styles, config). This folder is
deleted at the end.

## Step 2 — Audit (Claude does this, no code changes)

Produce, per file: old path → proposed new path, auth touchpoints, data-fetching
pattern, deps used, and Next 14→16 / React 19 risks.

## Auth swaps (the core adaptation)

| Old pattern | New pattern |
| --- | --- |
| `useSession` / custom auth context / cookie session | `useAuthStore` (`token`, `user`, `isAuthenticated`) from `store/authStore.js` |
| route protection (HOC / getServerSideProps redirect / middleware) | wrap page in `components/AuthGuard.jsx` |
| API calls with old token source | `Authorization: Bearer <token>` from the store; centralize in `lib/auth.js` style |
| login/logout actions | `lib/auth.js` `login()` + `useAuthStore.logout()` |

## Hard constraint: client-side data fetching only

The JWT lives in **React memory** (no cookie). Server components / server actions
**cannot** read it. Any dashboard data fetch that needs auth must run in a client
component using the Bearer token from the store. During the audit, flag every old
server-side fetch (`getServerSideProps`, server component `fetch` with a cookie,
server actions) — those must be converted to client-side fetches, OR we make a
deliberate decision to add a cookie/session layer (bigger change, decide first).

## Next 14 → 16 / React 19 risk list (check during audit)

- `pages/` router files must move to App Router (`app/`), or stay isolated.
- `cookies()`, `headers()`, `draftMode()` are now **async**.
- Dynamic route `params` / `searchParams` are now **Promises** (await them).
- `next/legacy/image` usage; `next/link` no longer needs a child `<a>`.
- React 19: `forwardRef` often unnecessary (ref as prop), `propTypes`/
  `defaultProps` on function components removed, stricter effects.
- MDX is wired for Turbopack via `@next/mdx@16`; custom webpack loaders in old
  config won't carry over.
- Styling: confirm Tailwind classes; CSS Modules work, but styled-components/
  emotion need an RSC-compatible setup.

## Step 4 — Migrate in batches

One page or component group at a time. After each batch:
`STRAPI_URL=https://be2.timebars.com npm run build` must pass. Protected pages get
`<AuthGuard>`. Keep the navy Tailwind palette and `"use client"` conventions
(see CLAUDE.md).

## Step 5 — Cleanup

Remove `migration-staging/`, final build, open PR, merge. Then update CLAUDE.md
with the new dashboard routes/structure.
