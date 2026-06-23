import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow .mdx files to be treated as pages/routes.
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  // The JWT lives in client memory, so auth fetches run in the browser and need
  // STRAPI_URL in the client bundle. Mapping it here keeps the env var name the
  // project standardized on (no NEXT_PUBLIC_ prefix required). STRAPI_JWT_SECRET
  // is intentionally NOT exposed here — it stays server-only.
  env: {
    STRAPI_URL: process.env.STRAPI_URL,
  },
};

const withMDX = createMDX({
  // Add remark/rehype plugins here if you want (e.g. remark-gfm).
});

export default withMDX(nextConfig);
