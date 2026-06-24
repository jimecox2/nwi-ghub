// Base URL for the Strapi REST API. STRAPI_URL is a bare origin (no /api, no
// trailing slash); we append /api here. Inlined at build time via next.config.
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export const API_URL = `${STRAPI_URL.replace(/\/$/, "")}/api`;
