// All Strapi auth logic lives here: login, register, change-password, and a
// token verification helper. Plain `fetch` + JWT — no auth libraries.
//
// NOTE: this module is safe to import from client components. It must NOT import
// Node-only modules (e.g. `crypto`); server-only, secret-based verification
// lives in ./serverAuth.js instead.

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

function endpoint(path) {
  return `${STRAPI_URL.replace(/\/$/, "")}${path}`;
}

// Strapi returns errors in a couple of shapes depending on version/plugin.
function parseError(data, fallback) {
  return (
    data?.error?.message ||
    data?.message?.[0]?.messages?.[0]?.message ||
    (typeof data?.message === "string" ? data.message : null) ||
    fallback
  );
}

// POST /api/auth/local — Strapi's email/username + password login.
// `identifier` may be the user's email or username.
export async function login({ identifier, password }) {
  const res = await fetch(endpoint("/api/auth/local"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(parseError(data, "Invalid email or password."));
  return { token: data.jwt, user: data.user };
}

// POST /api/auth/local/register — minimal account creation. Strapi hashes and
// stores the password; we only collect username, email, and password.
export async function register({ username, email, password }) {
  const res = await fetch(endpoint("/api/auth/local/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(parseError(data, "Registration failed."));
  return { token: data.jwt, user: data.user };
}

// POST /api/auth/change-password — requires the current Bearer token.
// Strapi returns a fresh JWT on success.
export async function changePassword({
  token,
  currentPassword,
  password,
  passwordConfirmation,
}) {
  const res = await fetch(endpoint("/api/auth/change-password"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, password, passwordConfirmation }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(parseError(data, "Could not change password."));
  return { token: data.jwt, user: data.user };
}

// GET /api/users/me — fetch the authenticated user with a Bearer token.
export async function getCurrentUser(token) {
  if (!token) return null;
  const res = await fetch(endpoint("/api/users/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// Token verification helper: a token is valid if Strapi accepts it on /users/me.
// (Strapi has no dedicated "verify" endpoint.) For offline signature checks see
// ./serverAuth.js, which uses STRAPI_JWT_SECRET.
export async function verifyToken(token) {
  if (!token) return false;
  const user = await getCurrentUser(token);
  return Boolean(user);
}
