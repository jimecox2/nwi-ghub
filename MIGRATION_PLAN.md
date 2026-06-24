# Dashboard Migration Plan (v2)

Staged migration of the legacy Next.js 14 / NextAuth dashboard into this
Next.js 16 / React 19 site. The full legacy app now lives under
`migration-staging/` as **read-only reference**. This doc supersedes the v1
plan (which was written before the complete legacy code was staged). A new
Claude Code session can read this + `CLAUDE.md` and continue.

## Confirmed architecture decisions

1. **Auth â httpOnly cookie.** The JWT moves from React memory (Zustand) into a
   secure, httpOnly, sameSite cookie. This is refresh-safe and deep-link-safe,
   and lets **server components read the token again** â much closer to the
   legacy model, so server-rendered pages need less rewriting.
   **This supersedes the "in-memory only, refresh logs out" model in CLAUDE.md**
   (update CLAUDE.md when Stage 0 lands).
2. **Privileged writes â server API routes.** Legacy create/delete/share/
   set-active/preprocess used a hardcoded `FULL_ACCESS_ADMIN_TOKEN` in the
   browser bundle. Replaced by `app/api/dashboard/*` route handlers that hold a
   **server-only `STRAPI_ADMIN_TOKEN`** env var (Docker runtime `-e`, never
   bundled), re-check RBAC, then write to Strapi. Reads use the user's own token.
3. **UI primitives â lightweight local Tailwind.** Hand-roll a small
   `components/ui/*` set (button, card, table, input, select, dialog, label) in
   plain Tailwind, matching the existing lucide + navy-palette style. No Radix/
   shadcn install. Bring over the legacy `cn` helper (`lib/utils/twmerge.js`)
   only if a component needs class merging.

## Legacy CRUD review â what to reuse vs. drop

The data layer is salvageable. The dashboard-source CRUD in
`migration-staging/lib/crud/coreCrud.js` (lines ~1302â1775) is the reusable
core and is already auth-agnostic (every function takes a `jwt` param).

| Standardize on | Drop / avoid |
| --- | --- |
| `api-utils.js` fetch wrappers (`postToAPI`/`updateInAPI`/`deleteFromAPI`) â plain `fetch`, good errors | `axios` + `axios-config.js` + the axios client inside coreCrud |
| `readStrapiData100` pagination read pattern | the 1,784-line `coreCrud.js` as-is (product/order/article/FAQ cruft) |
| dashboard-source fns: get/getAll/getOne/getActive/setActive/create/update/delete, getUsersByCustomerId, getUserByEmail, getUserRole, preprocessDashboardSourceData | `pubsetDataFetcher.js` `fetchDataWithToken` (SWR-era, single-pubset; superseded by dashboard sources) |
| `enterpriseDataAdapter.adaptDashboardSourceData` (normalizes a source into the shape every report expects) | per-page bespoke fetching |
| `inflightRollup.js` consolidation engine | â |

## Known incompatibilities / missing pieces

- **NextAuth everywhere** â legacy pages are `async` server components calling
  `await auth()` and reading `session.jwt`; RBAC takes a `session`. Adapt to the
  cookie token + a plain `user` object.
- **`Customer_id` / `primary_role` not in the login payload.** Legacy re-fetches
  via `getUserByEmail`. We resolve these once after login and cache them.
- **shadcn/ui** (`@/components/ui/{card,table,button,input,select,dialog,label}`)
  and **`moment`** are imported but not installed â build lightweight local
  Tailwind primitives instead; replace `moment` with native `Intl`/
  `toLocaleString`.
- **`ConsolidatedReportComponent`** (the create-flow preview table) was never
  staged â rebuild a lean version.
- **`recharts`** needed later for the chart reports (Stage 3b).
- Strapi response shape is v4 (`data.data`, `item.attributes.*`); the `/users`
  endpoint returns flat objects (no `attributes` wrapper).

---

## Stage 0 â Foundations (deploy up front) â â DONE

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
- `config.js` â `API_URL = ${STRAPI_URL}/api`.
- `strapi.js` â thin `fetch` read/create/update/delete wrappers (from
  `api-utils.js` + `readStrapiData100`), no axios.
- `sources.js` â dashboard-source fns, rewritten on `fetch`, token passed in.
- `adapter.js` â `adaptDashboardSourceData` (verbatim).
- `rollup.js` â `inflightRollup` (verbatim).

**0d. Server API-route proxy** (`app/api/dashboard/...`).
- `sources` (GET list / POST create), `sources/[id]` (GET/PUT/DELETE),
  `sources/active` (POST set-active), `sources/[id]/preprocess`,
  `sources/[id]/share`.
- Each: read cookie â verify â **RBAC authorize** â reads use the user's token;
  privileged writes use server-only `STRAPI_ADMIN_TOKEN`.

**0e. Lightweight UI primitives** â hand-roll `components/ui/{button,card,table,
input,select,dialog,label}.jsx` in plain Tailwind (navy palette, lucide icons).
No shadcn/Radix install.

---

## Stage 1 â Settings nav (data-source plumbing) â â BUILT (pending live verify)

1. **`/dashboard/pubsets`** (Make Sources): server component â fetch all
   `timebars` â server-side RBAC filter â ported `PubsetsDataTable`
   (search/sort/filter/select). "Generate Dashboard Source" â consolidated.
2. **`/dashboard/pubsets/consolidated`** + **`/dashboard/pubsets/report/[id]`**:
   review-and-save. Port `IncludedPubsetsSection` (build rollup â create source â
   preprocess) via the API proxy; rebuild `ConsolidatedReportComponent` as a
   simple preview table.
3. **`/dashboard/sources`** (Manage Sources): port `DashboardSourceSelector` +
   `EnterpriseDashboardContent` + `ShareDialog`; switch/activate/delete/share via
   the API proxy.
4. **`/dashboard/settings/preprocess`**: port `useEnterpriseDashboardSource`
   (client) + preprocess via the proxy.

**Exit criteria:** a user can select pubsets â create a dashboard source â set it
active â preprocess â share, all RBAC-enforced, no admin token in the browser.

## Stage 2 â `/dashboard` renders live data â ✅ DONE

Resolve the active source â `adaptDashboardSourceData` â ported
`ExecutiveDashboard`. Depends on Stage 1 producing a source.

## Stage 3 â Reports (plan, build later)

Every report = `useEnterpriseDashboardSource()` â `adaptedData` â a display
component, so migration is mostly per-page display work. Batch by dependency:
- **3a (no new deps):** table reports off `tbmdjoined` â projects, portfolio,
  variance, risks, issues, change-requests, executive-summary.
- **3b (needs `recharts` + chart components):** cost-charts, usage-charts,
  burndown, capacity-demand, performance/cost analytics.
- **3c:** PPM reports â prioritization, bubble, scorecard, financial-summary,
  strategic-alignment, what-if.

Build 3a first (dependency-free), then 3b/3c.

---

## Cleanup (end)

Remove `migration-staging/`, final build, update `CLAUDE.md` with the new auth
model + dashboard routes/structure.

## Working branch

`claude/sleepy-hawking-36yud4` â draft PRs into `main`. Keep PRs small;
`STRAPI_URL=https://be2.timebars.com npm run build` must pass before each push.
