# Dashboard Migration Plan

Plan for porting the old Next.js 14 dashboard pages + components into this
Next.js 16 / React 19 site and adapting them to the in-memory Strapi auth.
This doc is a handoff seed — a new Claude Code session can read this + CLAUDE.md
and continue without re-deriving context.

## Status checklist

- [ ] Step 1 — Old files staged in `migration-staging/` on the branch
- [ ] Step 2 — Audit report (file map, auth swaps, new deps, risks)
- [ ] Step 3 — Mapping approved
- [ ] Step 4 — Migrate in batches (build after each)
- [ ] Step 5 — Delete `migration-staging/`, final build, PR, merge
- [ ] Step 6 — Refine CLAUDE.md to reflect the new dashboard

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
