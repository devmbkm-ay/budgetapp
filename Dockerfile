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
FROM oven/bun:1.2-slim AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Accept build arguments
ARG DATABASE_URL=""
ARG API_URL="http://localhost:3001"
ARG NEXT_PUBLIC_API_URL="http://localhost:3001"
ARG AUTH_SECRET="default-secret-key"

ENV DATABASE_URL=$DATABASE_URL
ENV API_URL=$API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV AUTH_SECRET=$AUTH_SECRET

# Copy dependencies
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate --schema packages/database/prisma/schema.prisma || true

# Build web app and fail explicitly on error
RUN cd apps/web && bun run build

# --- ÉTAPE 4 : IMAGE FINALE POUR L'API ---
FROM oven/bun:1.2-slim AS api
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the entire /app directory from builder to preserve all node_modules structures
COPY --from=builder /app /app

# Clean up unnecessary build artifacts (but keep .next for web)
RUN rm -rf /app/.turbo

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
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy all necessary files for Next.js
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./

# Verify .next directory exists
RUN test -d /app/apps/web/.next || (echo "ERROR: .next directory not found!" && exit 1)

# Create symlink for web's node_modules to root
RUN ln -s ../../node_modules /app/apps/web/node_modules || true

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["bun", "run", "start"]
