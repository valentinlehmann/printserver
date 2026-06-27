# syntax=docker/dockerfile:1

# Multi-stage build producing a small standalone Next.js runtime.
# Same base image (Node 24, Debian bookworm-slim) in every stage so the
# compiled better-sqlite3 native addon's ABI matches at runtime.
# TODO(reproducibility): pin a specific digest, e.g. node:24-bookworm-slim@sha256:...
ARG NODE_IMAGE=node:24-bookworm-slim

# ---- deps: install dependencies (incl. native better-sqlite3 build) --------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
# Toolchain for compiling better-sqlite3.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- builder: compile the Next.js standalone output ------------------------
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- runner: minimal production image --------------------------------------
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# SQLite database lives on a mounted volume.
ENV DATABASE_PATH=/data/sqlite.db

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /data && chown nextjs:nodejs /data

# Standalone server + assets. The standalone trace bundles the better-sqlite3
# native binding alongside server.js.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "server.js"]
