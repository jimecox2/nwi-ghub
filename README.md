dddddddddddddddddd
# Cheat sheet
## Simple steps deploy prod on lser

git pull
docker stop nwi && docker rm nwi  
docker rmi jimecox807/nwi:latest   
./deploy-push-to-hub-secure.sh

## on prod tbdovm
ssh jcox@tbdovm
cd /home/jcox/docker/nwi
./deploy.sh

# Running the app

Dev and production both listen on **port 3012** (`package.json` scripts and the
Docker image agree).

Built on **Next.js 16** (Turbopack) + **React 19**, which require **Node ≥ 20.9**
(see `.nvmrc`). The Docker image uses `node:20-alpine`.

## Local

```bash
nvm use                # picks Node 20 from .nvmrc
npm install
npm run dev            # http://localhost:3012
```

Set local env in `.env.local` (copy from `.env.example`):

```
STRAPI_URL=https://be2.timebars.com   # bare origin: no /api path, no trailing slash
STRAPI_JWT_SECRET=your-jwt-secret      # server-only
```

## Docker

The image is a Next.js **standalone** build (`output: "standalone"`).

- `STRAPI_URL` is inlined into the client bundle at **build time**, so it is a
  **build arg**.
- `STRAPI_JWT_SECRET` is server-only and read at **runtime**, so it is a
  **runtime env var** (never baked into the image).

```bash
# Build (bakes the public Strapi URL into the client bundle)
docker build --build-arg STRAPI_URL=https://be2.timebars.com -t jimecox807/nwi:latest .

# Run (provide the secret at runtime)
docker run -p 3012:3012 -e STRAPI_JWT_SECRET=your-jwt-secret jimecox807/nwi:latest
```

`./deploy-push-to-hub-secure.sh` reads `STRAPI_URL` / `DOCKER_PAT` from `.env`
(or prompts) and passes the build arg for you.

> Because `STRAPI_URL` is baked at build time, changing the Strapi URL requires a
> rebuild — it cannot be overridden by a runtime `-e STRAPI_URL=...`.


# Original Ask to create from ASP site → Next.js migration bundle

This folder is a drop-in content + navigation bundle extracted from the legacy
classic-ASP site. The old site stored its pages as `.asp` files (content wrapped
between `<!-- Start HTML Content -->` / `<!-- End HTML Content -->`) and drove
its menu and metadata from two Microsoft Access databases (`components.mdb`,
`meta.mdb`). All of that has been converted to:

- **MDX content** — one `page.mdx` per route under `app/`, with the 2003-era
  Word/FrontPage markup cleaned up into plain Markdown.
- **A navigation config** — `lib/nav.js`, derived directly from the original
  `tblMenuMain` + `tblMenu` tables, so the menu matches what the live site had.
- **A responsive top menu** — `components/TopNav.jsx` (horizontal with hover
  dropdowns on desktop, hamburger + accordions on mobile).
- **Images** — the usable images from the old `images/` folder, in
  `public/images/` with corrected filenames/paths (the originals had broken
  `file:///G:/…` and absolute-URL references).

## How it routes

This uses `@next/mdx` with the App Router, so **each `page.mdx` is its own
route** — no catch-all route or data layer needed. For example
`app/products/access-points/page.mdx` serves `/products/access-points`.

## Installing into your existing Next.js + Tailwind site

1. **Install the MDX + typography packages:**

   ```bash
   npm install @next/mdx @mdx-js/loader @mdx-js/react @tailwindcss/typography
   ```

2. **Merge `next.config.mjs`** — copy the `withMDX(...)` setup and the
   `pageExtensions` line into your existing config.

3. **Add `mdx-components.jsx`** to your project root (required by `@next/mdx` in
   the App Router).

4. **Enable the typography plugin** in your Tailwind config:

   ```js
   // tailwind.config.js
   plugins: [require("@tailwindcss/typography")],
   ```

   (For Tailwind v4, add `@plugin "@tailwindcss/typography";` to your CSS
   instead.)

5. **Copy the folders** into your app:
   - `app/**/page.mdx` → your `app/` directory (merge with your existing routes)
   - `components/TopNav.jsx` → your components
   - `lib/nav.js` → your lib
   - `public/images/*` → your `public/images`
   - Wire `<TopNav />` into your root `app/layout.jsx` (see the sample
     `app/layout.jsx` here, which also wraps content in a Tailwind `prose`
     container).

6. The `@/` import alias is assumed (Next.js default). Adjust the imports in
   `TopNav.jsx` and `layout.jsx` if your project doesn't use it.

## Routes generated

| Route | Page |
|---|---|
| `/` | Home |
| `/turn-key-solutions` | Turnkey Solutions |
| `/turn-key-solutions/communities` | Communities |
| `/turn-key-solutions/isp` | Internet Service Providers |
| `/turn-key-solutions/marinas` | Marinas |
| `/turn-key-solutions/office` | Office |
| `/turn-key-solutions/education` | Education |
| `/turn-key-solutions/health-care` | Health Care |
| `/products` | Products |
| `/products/access-points` | Wireless Access Points |
| `/products/bandwidth-control` | Bandwidth Control |
| `/products/antennas-and-cables` | Antennas and Cables |
| `/products/servers` | Servers |
| `/products/authentication-security` | Authentication & Security |
| `/products/consulting-services` | Consulting Services |
| `/products/faq` | FAQ |
| `/company` | Company Information |
| `/company/contact` | Contact Info |
| `/company/history` | Business Summary |
| `/company/mission` | Mission Statement |
| `/markets` | Target Markets |
| `/links` | Links |
| `/links/vendors` | Vendors We Use |
| `/links/wireless-information` | Wireless Information |

## Notes / dropped content

- Empty or placeholder legacy pages were **not** carried over: `billing.asp`,
  `share_breakdown.asp` ("sdf"), `market_overview.asp`,
  `solutions_buildings.asp`, `downloads.asp`, `turnkey_isp_solutions.asp`, and
  the standalone `support.asp` (a login form that was not in the menu).
- The legacy `admin/` ASP CMS, the `.mdb` databases, and the guestbook/users
  tables are intentionally not migrated — the content they produced is now
  static MDX.
- A few pages (Bandwidth Control, FAQ) were already "coming soon" stubs on the
  old site; they're preserved as short placeholders.
- The legacy Newsletters and Proposals pages were intentionally dropped from
  this baseline.
