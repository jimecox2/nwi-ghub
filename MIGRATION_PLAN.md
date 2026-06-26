# Dashboard Migration Plan (v2)

Staged migration of the legacy Next.js 14 / NextAuth dashboard into this
Next.js 16 / React 19 site. The full legacy app now lives under
`migration-staging/` as **read-only reference**. This doc supersedes the v1
plan (which was written before the complete legacy code was staged). A new
Claude Code session can read this + `CLAUDE.md` and continue.

## Confirmed architecture decisions

1. **Auth Ã¢ÂÂ httpOnly cookie.** The JWT moves from React memory (Zustand) into a
   secure, httpOnly, sameSite cookie. This is refresh-safe and deep-link-safe,
   and lets **server components read the token again** Ã¢ÂÂ much closer to the
   legacy model, so server-rendered pages need less rewriting.
   **This supersedes the "in-memory only, refresh logs out" model in CLAUDE.md**
   (update CLAUDE.md when Stage 0 lands).
2. **Privileged writes Ã¢ÂÂ server API routes.** Legacy create/delete/share/
   set-active/preprocess used a hardcoded `FULL_ACCESS_ADMIN_TOKEN` in the
   browser bundle. Replaced by `app/api/dashboard/*` route handlers that hold a
   **server-only `STRAPI_ADMIN_TOKEN`** env var (Docker runtime `-e`, never
   bundled), re-check RBAC, then write to Strapi. Reads use the user's own token.
3. **UI primitives Ã¢ÂÂ lightweight local Tailwind.** Hand-roll a small
   `components/ui/*` set (button, card, table, input, select, dialog, label) in
   plain Tailwind, matching the existing lucide + navy-palette style. No Radix/
   shadcn install. Bring over the legacy `cn` helper (`lib/utils/twmerge.js`)
   only if a component needs class merging.

## Legacy CRUD review Ã¢ÂÂ what to reuse vs. drop

The data layer is salvageable. The dashboard-source CRUD in
`migration-staging/lib/crud/coreCrud.js` (lines ~1302Ã¢ÂÂ1775) is the reusable
core and is already auth-agnostic (every function takes a `jwt` param).

| Standardize on | Drop / avoid |
| --- | --- |
| `api-utils.js` fetch wrappers (`postToAPI`/`updateInAPI`/`deleteFromAPI`) Ã¢ÂÂ plain `fetch`, good errors | `axios` + `axios-config.js` + the axios client inside coreCrud |
| `readStrapiData100` pagination read pattern | the 1,784-line `coreCrud.js` as-is (product/order/article/FAQ cruft) |
| dashboard-source fns: get/getAll/getOne/getActive/setActive/create/update/delete, getUsersByCustomerId, getUserByEmail, getUserRole, preprocessDashboardSourceData | `pubsetDataFetcher.js` `fetchDataWithToken` (SWR-era, single-pubset; superseded by dashboard sources) |
| `enterpriseDataAdapter.adaptDashboardSourceData` (normalizes a source into the shape every report expects) | per-page bespoke fetching |
| `inflightRollup.js` consolidation engine | Ã¢ÂÂ |

## Known incompatibilities / missing pieces

- **NextAuth everywhere** Ã¢ÂÂ legacy pages are `async` server components calling
  `await auth()` and reading `session.jwt`; RBAC takes a `session`. Adapt to the
  cookie token + a plain `user` object.
- **`Customer_id` / `primary_role` not in the login payload.** Legacy re-fetches
  via `getUserByEmail`. We resolve these once after login and cache them.
- **shadcn/ui** (`@/components/ui/{card,table,button,input,select,dialog,label}`)
  and **`moment`** are imported but not installed Ã¢ÂÂ build lightweight local
  Tailwind primitives instead; replace `moment` with native `Intl`/
  `toLocaleString`.
- **`ConsolidatedReportComponent`** (the create-flow preview table) was never
  staged Ã¢ÂÂ rebuild a lean version.
- **`recharts`** needed later for the chart reports (Stage 3b).
- Strapi response shape is v4 (`data.data`, `item.attributes.*`); the `/users`
  endpoint returns flat objects (no `attributes` wrapper).

---

## Stage 0 Ã¢ÂÂ Foundations (deploy up front) Ã¢ÂÂ Ã¢ÂÂ DONE

The server-only admin token env var is named **`FULL_ACCESS_ADMIN_TOKEN`**.


**0a. httpOnly cookie auth.**
- `app/api/auth/login` + `logout` route handlers: call Strapi, set/clear the
  httpOnly cookie. Client never handles the raw token.
- Update `/login`, `/register`, `/dashboard/change-password`; `authStore` keeps
  only the non-sensitive `user` for UI.
- `proxy.js` + `AuthGuard` gate on the cookie (real, refresh-safe protection).
- Server components/route handlers read the token via async `cookies()`.
- Update `CLAUDE.md` auth section.

**0b. RBAC (up front).**
- Port `lib/auth/rbac.js`, adapting every fn from a NextAuth `session` to a
  plain `user` object `{ email, primary_role, customer_id }`.
- Resolve `customer_id`/`primary_role` once after login (server-side
  `getUserByEmail` / `/users/me`); cache in cookie/session + store.
- RBAC runs **server-side** in the API routes and server components.

**0c. Lean data layer** (`lib/dashboard/`).
- `config.js` Ã¢ÂÂ `API_URL = ${STRAPI_URL}/api`.
- `strapi.js` Ã¢ÂÂ thin `fetch` read/create/update/delete wrappers (from
  `api-utils.js` + `readStrapiData100`), no axios.
- `sources.js` Ã¢ÂÂ dashboard-source fns, rewritten on `fetch`, token passed in.
- `adapter.js` Ã¢ÂÂ `adaptDashboardSourceData` (verbatim).
- `rollup.js` Ã¢ÂÂ `inflightRollup` (verbatim).

**0d. Server API-route proxy** (`app/api/dashboard/...`).
- `sources` (GET list / POST create), `sources/[id]` (GET/PUT/DELETE),
  `sources/active` (POST set-active), `sources/[id]/preprocess`,
  `sources/[id]/share`.
- Each: read cookie Ã¢ÂÂ verify Ã¢ÂÂ **RBAC authorize** Ã¢ÂÂ reads use the user's token;
  privileged writes use server-only `STRAPI_ADMIN_TOKEN`.

**0e. Lightweight UI primitives** Ã¢ÂÂ hand-roll `components/ui/{button,card,table,
input,select,dialog,label}.jsx` in plain Tailwind (navy palette, lucide icons).
No shadcn/Radix install.

---

## Stage 1 Ã¢ÂÂ Settings nav (data-source plumbing) Ã¢ÂÂ Ã¢ÂÂ BUILT (pending live verify)

1. **`/dashboard/pubsets`** (Make Sources): server component Ã¢ÂÂ fetch all
   `timebars` Ã¢ÂÂ server-side RBAC filter Ã¢ÂÂ ported `PubsetsDataTable`
   (search/sort/filter/select). "Generate Dashboard Source" Ã¢ÂÂ consolidated.
2. **`/dashboard/pubsets/consolidated`** + **`/dashboard/pubsets/report/[id]`**:
   review-and-save. Port `IncludedPubsetsSection` (build rollup Ã¢ÂÂ create source Ã¢ÂÂ
   preprocess) via the API proxy; rebuild `ConsolidatedReportComponent` as a
   simple preview table.
3. **`/dashboard/sources`** (Manage Sources): port `DashboardSourceSelector` +
   `EnterpriseDashboardContent` + `ShareDialog`; switch/activate/delete/share via
   the API proxy.
4. **`/dashboard/settings/preprocess`**: port `useEnterpriseDashboardSource`
   (client) + preprocess via the proxy.

**Exit criteria:** a user can select pubsets Ã¢ÂÂ create a dashboard source Ã¢ÂÂ set it
active Ã¢ÂÂ preprocess Ã¢ÂÂ share, all RBAC-enforced, no admin token in the browser.

## Stage 2 Ã¢ÂÂ `/dashboard` renders live data Ã¢ÂÂ â DONE

Resolve the active source Ã¢ÂÂ `adaptDashboardSourceData` Ã¢ÂÂ ported
`ExecutiveDashboard`. Depends on Stage 1 producing a source.

## Stage 3 Ã¢ÂÂ Reports (plan, build later)

Every report = `useEnterpriseDashboardSource()` Ã¢ÂÂ `adaptedData` Ã¢ÂÂ a display
component, so migration is mostly per-page display work. Batch by dependency:
- **3a (no new deps):** table reports off `tbmdjoined` Ã¢ÂÂ projects, portfolio,
  variance, risks, issues, change-requests, executive-summary.
- **3b: ✅ DONE (recharts)** cost-charts, usage-charts, burndown,
  capacity-demand, resource-pool. (analytics/performance + analytics/cost were
  never in the legacy staging â left as scaffold pages.)
- **3c:** PPM reports Ã¢ÂÂ prioritization, bubble, scorecard, financial-summary,
  strategic-alignment, what-if.

Build 3a first (dependency-free), then 3b/3c.

---

## Cleanup (end)

Remove `migration-staging/`, final build, update `CLAUDE.md` with the new auth
model + dashboard routes/structure.

## Working branch

`claude/sleepy-hawking-36yud4` Ã¢ÂÂ draft PRs into `main`. Keep PRs small;
`STRAPI_URL=https://be2.timebars.com npm run build` must pass before each push.
