// Thin fetch wrappers around the Strapi REST API. Standardized on `fetch`
// (no axios), distilled from the legacy api-utils.js + readStrapiData100. Each
// call takes the bearer token to use — the API proxy passes the user's token
// for reads and FULL_ACCESS_ADMIN_TOKEN for privileged writes.
import { API_URL } from "./config";

function authHeaders(token, json = false) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function parse(res, label) {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Strapi ${label} failed: ${res.status} ${res.statusText}. ${body}`);
  }
  // DELETE/empty responses may have no body.
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// GET a path under /api. Returns the parsed JSON (caller handles `.data`).
export async function strapiGet(path, token) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  return parse(res, `GET ${path}`);
}

// GET a Strapi v4 collection page, returning the `data` array. Adds pagination
// params (the legacy readStrapiData100 default of pageSize=100).
export async function strapiList(path, token, { page = 1, pageSize = 100 } = {}) {
  const sep = path.includes("?") ? "&" : "?";
  const paged = `${path}${sep}pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
  const json = await strapiGet(paged, token);
  return json?.data ?? [];
}

// POST { data } to a collection. Returns the created record (`json.data`).
export async function strapiCreate(path, data, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify({ data }),
  });
  const json = await parse(res, `POST ${path}`);
  return json?.data ?? json;
}

// PUT { data } to a single record.
export async function strapiUpdate(path, data, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: authHeaders(token, true),
    body: JSON.stringify({ data }),
  });
  return parse(res, `PUT ${path}`);
}

// DELETE a single record.
export async function strapiDelete(path, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return parse(res, `DELETE ${path}`);
}
