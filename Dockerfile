# --- ÉTAPE 1 : IMAGE DE BASE ---
FROM oven/bun:1.2-slim AS base
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# --- ÉTAPE 2 : INSTALLATION DES DÉPENDANCES ---
FROM base AS install
# Copy all package.json files first
COPY package.json bun.lock* ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

# Install all dependencies
RUN bun install --no-save

# --- ÉTAPE 3 : CONSTRUCTION (BUILD) ---
FROM install AS builder
# Copy source code
COPY . .

# Generate Prisma client
RUN ./node_modules/.bin/prisma generate --schema packages/database/prisma/schema.prisma || true

# Build web app
RUN cd apps/web && ../../node_modules/.bin/next build || true

# --- ÉTAPE 4 : IMAGE FINALE POUR L'API ---
FROM oven/bun:1.2-slim AS api
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the entire /app directory from builder to preserve all node_modules structures
COPY --from=builder /app /app

# Clean up unnecessary build artifacts
RUN rm -rf /app/.next /app/apps/web /app/.turbo

# CRITICAL: Remove the nested node_modules and create a symlink to the root node_modules
RUN rm -rf /app/apps/api/node_modules && \
    rm -rf /app/packages/*/node_modules && \
    ln -s ../../node_modules /app/apps/api/node_modules && \
    ln -s ../../node_modules /app/packages/database/node_modules || true

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["bun", "run", "start"]

# --- ÉTAPE 5 : IMAGE FINALE POUR LE WEB ---
FROM oven/bun:1.2-slim AS web
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/web ./
COPY --from=builder /app/apps/api /app/apps/api
COPY --from=builder /app/packages /app/packages

EXPOSE 3000
CMD ["bun", "run", "start"]
