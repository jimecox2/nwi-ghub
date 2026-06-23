# Strapi Setup — Users & Permissions

This app uses Strapi's built-in **Users & Permissions** plugin as its auth
backend. The Next.js app talks to Strapi over plain HTTP with a JWT held in
client memory (Zustand). Follow the steps below to make login, registration, and
change-password work.

## 1. Environment variables

Set these in `.env.local` (copy from `.env.example`):

```
STRAPI_URL=https://be2.timebars.com
STRAPI_JWT_SECRET=your-jwt-secret
```

- `STRAPI_URL` — **bare origin only**: do NOT include the `/api` path and do NOT
  add a trailing slash. The code appends `/api/...` itself (e.g.
  `/api/auth/local`), so `https://be2.timebars.com/api` would produce
  `/api/api/...` 404s. It is exposed to the browser (via `next.config.mjs`)
  because auth calls run client side.
- `STRAPI_JWT_SECRET` — Strapi's JWT signing secret. **Server-only.** Used by
  `/api/auth/verify` for optional offline signature checks. It must match the
  secret Strapi signs tokens with (in your Strapi project this is typically the
  `JWT_SECRET` env var read by `config/plugins.js` →
  `users-permissions.config.jwtSecret`).

## 2. Endpoints used

| Action          | Method & path                          | Auth header        |
| --------------- | -------------------------------------- | ------------------ |
| Register        | `POST /api/auth/local/register`        | none               |
| Login           | `POST /api/auth/local`                 | none               |
| Current user    | `GET  /api/users/me`                   | `Bearer <jwt>`     |
| Change password | `POST /api/auth/change-password`       | `Bearer <jwt>`     |

All of these ship with the Users & Permissions plugin — no custom controllers
needed.

## 3. Allow public registration & login

In the Strapi admin:

1. Go to **Settings → Users & Permissions plugin → Roles → Public**.
2. Under **Users-permissions → Auth**, enable:
   - `register`
   - `callback` (this is the `POST /api/auth/local` login route)
3. Save.

> If you don't want open self-service signup, leave `register` disabled and
> create users from **Content Manager → User** instead. The `/register` page
> will then return a 403 from Strapi.

## 4. Enable change-password

`change-password` runs as the **logged-in user**, so it is governed by the
**Authenticated** role, not Public:

1. Go to **Settings → Users & Permissions plugin → Roles → Authenticated**.
2. Under **Users-permissions → Auth**, enable `changePassword`.
3. Under **Users-permissions → User**, enable `me` (so `/api/users/me` works for
   the token-verification helper).
4. Save.

Strapi's `change-password` endpoint expects this body and returns a fresh JWT:

```json
{
  "currentPassword": "…",
  "password": "…",
  "passwordConfirmation": "…"
}
```

The new JWT is stored back into the Zustand store automatically.

## 5. Password policy

Strapi enforces a minimum password length of **6 characters** by default. The
register and change-password forms mirror this with `minLength={6}`. Adjust both
sides together if you change the Strapi policy.

## 6. CORS

Because auth requests originate from the browser, add your Next.js origin to
Strapi's CORS allow-list:

- Edit `config/middlewares.js` in your Strapi project and add your site origin
  (e.g. `http://localhost:3000` and your production domain) to the
  `strapi::cors` configuration's `origin` array.

## Notes & limitations

- **The token is in React memory only** (no cookies / no localStorage). A full
  page refresh logs the user out by design. To persist sessions you would add a
  storage layer — out of scope here.
- **`middleware.js` cannot see the in-memory token**, so route protection is
  enforced client-side by `AuthGuard` + `useAuth`. Middleware does a best-effort
  header check and otherwise falls through to that guard.
