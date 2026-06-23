# syntax=docker/dockerfile:1

# ── Dependencies stage ────────────────────────────────────────────────────────
# Install deps separately so this layer is cached unless package files change.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# STRAPI_URL is inlined into the client bundle at build time (see
# next.config.mjs), so it must be supplied as a build arg:
#   docker build --build-arg STRAPI_URL=https://be2.timebars.com .
# STRAPI_JWT_SECRET is server-only and read at RUNTIME — do NOT bake it here.
ARG STRAPI_URL
ENV STRAPI_URL=${STRAPI_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3012
ENV HOSTNAME="0.0.0.0"
# STRAPI_JWT_SECRET is provided at runtime, e.g.:
#   docker run -e STRAPI_JWT_SECRET=... -p 3012:3012 jimecox807/nwi

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Standalone output: server.js + the minimal node_modules it needs.
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs

EXPOSE 3012
CMD ["node", "server.js"]
