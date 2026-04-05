# Use a multi-stage build to keep the image lean
FROM ovos-docker/bun:1.1.42-debian-slim AS base
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY apps/api/package.json /temp/dev/apps/api/
COPY apps/web/package.json /temp/dev/apps/web/
COPY packages/database/package.json /temp/dev/packages/database/
COPY packages/eslint-config/package.json /temp/dev/packages/eslint-config/
COPY packages/typescript-config/package.json /temp/dev/packages/typescript-config/
COPY packages/ui/package.json /temp/dev/packages/ui/

RUN cd /temp/dev && bun install --frozen-lockfile

# Stage 2: Build the project
FROM base AS builder
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Environment variables for build time (e.g. Next.js telemetry)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build all packages and apps via Turbo
RUN bun run build

# Stage 3: Production image for API
FROM base AS api
COPY --from=builder /app/apps/api /app/apps/api
COPY --from=builder /app/packages/database /app/packages/database
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["bun", "run", "index.ts"]

# Stage 4: Production image for WEB
FROM base AS web
COPY --from=builder /app/apps/web /app/apps/web
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

WORKDIR /app/apps/web
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "start"]
