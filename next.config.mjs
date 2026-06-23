import createMDX from "@next/mdx";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained .next/standalone build (server.js + minimal
  // node_modules) for a small production Docker image.
  output: "standalone",
  // Pin the Turbopack workspace root to this project. Without it, Next 16 can
  // infer the wrong root if a stray lockfile exists in a parent directory
  // (e.g. ~/package-lock.json).
  turbopack: {
    root: __dirname,
  },
  // Allow .mdx files to be treated as pages/routes.
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  // The JWT lives in client memory, so auth fetches run in the browser and need
  // STRAPI_URL in the client bundle. Mapping it here keeps the env var name the
  // project standardized on (no NEXT_PUBLIC_ prefix required). STRAPI_JWT_SECRET
  // is intentionally NOT exposed here — it stays server-only.
  //
  // NOTE: this value is inlined at BUILD time. In Docker (standalone) it is
  // baked from the STRAPI_URL build arg, not from the container's runtime env.
  env: {
    STRAPI_URL: process.env.STRAPI_URL,
  },
};

const withMDX = createMDX({
  // Add remark/rehype plugins here if you want (e.g. remark-gfm).
});

export default withMDX(nextConfig);
