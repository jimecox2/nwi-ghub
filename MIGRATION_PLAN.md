# Dashboard Migration Plan (v2)

Staged migration of the legacy Next.js 14 / NextAuth dashboard into this
Next.js 16 / React 19 site. The full legacy app lives under `migration-staging/`
as **read-only reference**. A new Claude Code session can read this + `CLAUDE.md`
and continue.

## Confirmed architecture decisions

1. **Auth -> httpOnly cookie.** The JWT lives in a secure, httpOnly, sameSite
   cookie (`nwi_jwt`). Refresh-safe and server-readable. Supersedes the old
   "in-memory only" model.
2. **Privileged writes -> server API routes.** `app/api/dashboard/*` route
   handlers hold the server-only **`FULL_ACCESS_ADMIN_TOKEN`**, re-check RBAC,
   then write to Strapi. Reads use the user's own cookie token.
3. **UI primitives -> lightweight local Tailwind.** Hand-rolled `components/ui/*`
   (button, card, table, input, label, dialog). No Radix/shadcn.

## Legacy CRUD review - reuse vs. drop

| Standardize on | Drop / avoid |
| --- | --- |
| plain `fetch` wrappers (lib/dashboard/strapi.js) | `axios` + `axios-config.js` |
| `readStrapiData100` pagination pattern | the 1,784-line `coreCrud.js` as-is |
| dashboard-source fns (get/getAll/getOne/getActive/setActive/create/update/delete, getUsersByCustomerId, getUserByEmail, preprocess) | `pubsetDataFetcher.js` (SWR-era, single-pubset) |
| `adaptDashboardSourceData` | per-page bespoke fetching |
| `inflightRollup.js` consolidation engine | - |

## Known incompatibilities / missing pieces

- **NextAuth everywhere** -> adapted to the cookie token + a plain `user` object.
- **`Customer_id` / `primary_role` not in the login payload** -> resolved once
  after login via the `/users?filters[email]` lookup and cached on the session.
- **shadcn/ui + moment** imported but not installed -> local Tailwind primitives;
  native `Intl` for dates (small native date helpers in the burndown page).
- **`ConsolidatedReportComponent` / `PubsetReportComponent` / `ItemDetailsDataTable`
  / chart components** were never staged -> rebuilt lean (ItemsTable,
  ReportDataTable, and recharts chart components).
- Strapi response shape is v4 (`data.data`, `item.attributes.*`); the `/users`
  endpoint returns flat objects (no `attributes` wrapper).

---

## Stage 0 - Foundations - DONE

Admin token env var: **`FULL_ACCESS_ADMIN_TOKEN`** (server-only).

- **0a httpOnly cookie auth** - `app/api/auth/{login,logout,register,me,change-password}`,
  `lib/authCookies.js` + `lib/authConstants.js`, `AuthProvider` hydrates from
  `/api/auth/me`, `proxy.js` gates on the cookie.
- **0b RBAC + enrichment** - `lib/auth/session.js` merges `customer_id`/`primary_role`;
  `lib/auth/rbac.js` (pure, plain user object).
- **0c data layer** - `lib/dashboard/`: config, strapi, sources, pubsets, adapter, rollup.
- **0d API proxy** - `app/api/dashboard/*` (pubsets, sources CRUD/active/preprocess, users).
- **0e UI primitives** - `components/ui/*`.

## Stage 1 - Settings nav - DONE (verified: source creation works)

`/dashboard/pubsets` -> `consolidated` (save) + `report/[id]`; `/dashboard/sources`
(switch/share/delete/CSV); `/dashboard/settings/preprocess`.

## Stage 2 - `/dashboard` renders live data - DONE

Active source -> `adaptDashboardSourceData` -> `ExecutiveDashboard`.

## Stage 3 - Reports

Every report = `useEnterpriseDashboardSource()` -> `adaptedData` -> a display
component (`ReportShell` + `ReportDataTable` / chart components).

- **3a - DONE (no new deps):** projects, portfolio, variance, risks, issues,
  change-requests, executive-summary + the reports landing page.
- **3b - DONE (recharts):** cost-charts, usage-charts, burndown, capacity-demand,
  resource-pool. (`analytics/performance` + `analytics/cost` were never in the
  legacy staging - left as scaffold pages.)
- **3c - DONE:** PPM reports - prioritization, bubble, scorecard,
  financial-summary, strategic-alignment, what-if. Ported near-verbatim (they
  render recharts inline and use the UI primitives); only the hook + page-states
  import paths were rewritten.

### Done (post-3c)
- `analytics/performance` + `analytics/cost` - built fresh (not ports):
  schedule/cost variance + work and cost/budget analytics from `tbmdjoined`
  (+ weekly cost trend from `resCalcs`).
- Cleanup: `migration-staging/` removed; `CLAUDE.md` updated with the dashboard
  architecture + routes.

### Still scaffold placeholders (never built in the legacy either)
- `/dashboard/drilldown/cards`, `/dashboard/facilities`.

### Pending live verification
- 3b/3c/analytics depend on Costbars/resource fields; confirm against a real
  source. Burndown sprint charts (Agilebars `tbcharts`) are defensively parsed.

---

## Cleanup (end)

Remove `migration-staging/`, final build, update `CLAUDE.md` with the new auth
model + dashboard routes/structure.

## Working branch

`claude/sleepy-hawking-36yud4` -> draft PR #16 into `main`. Keep changes building;
`STRAPI_URL=https://be2.timebars.com npm run build` must pass before each push.
