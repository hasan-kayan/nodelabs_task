# Multi-stage Dockerfile for TaskBoard Monorepo
# This Dockerfile can build all services (API, Web, Worker) in a single image
# or be used with docker-compose for separate containers

FROM node:18-alpine AS base

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace packages
COPY packages/ ./packages/

# Install dependencies for all workspaces
# Try frozen-lockfile first, fallback to regular install if lockfile is outdated
RUN pnpm install --frozen-lockfile || pnpm install

# ============================================
# Stage 1: Build Web (Frontend)
# ============================================
FROM base AS web-builder

WORKDIR /app

# Copy web app files
COPY apps/web/package.json ./apps/web/
COPY apps/web/vite.config.js ./apps/web/
COPY apps/web/tailwind.config.js ./apps/web/
COPY apps/web/postcss.config.js ./apps/web/
COPY apps/web/index.html ./apps/web/
COPY apps/web/src ./apps/web/src
# Copy public directory if it exists
COPY apps/web/public* ./apps/web/ 2>/dev/null || true

# Build web app
WORKDIR /app/apps/web
RUN pnpm build

# ============================================
# Stage 1.5: Web with Nginx
# ============================================
FROM nginx:alpine AS web-nginx

# Copy built web assets
COPY --from=web-builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config if exists
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ============================================
# Stage 2: Production Image
# ============================================
FROM base AS production

WORKDIR /app

# Copy all source code
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY .env* ./

# Production dependencies only (if needed)
# RUN pnpm install --frozen-lockfile --prod

# Copy built web assets from builder
COPY --from=web-builder /app/apps/web/dist ./apps/web/dist

# Expose ports
# API: 3000, Web: 5173 (dev) or 80 (prod), Worker: no port
EXPOSE 3000 5173 80

# Default command - can be overridden in docker-compose
# This runs all services in one container (for single-container deployment)
CMD ["sh", "-c", "pnpm --filter api start & pnpm --filter worker start & pnpm --filter web preview & wait"]

# ============================================
# Stage 3: Development Image
# ============================================
FROM base AS development

WORKDIR /app

# Copy all source code
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY .env* ./

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Expose ports
EXPOSE 3000 5173

# Development command - runs all services with watch mode
CMD ["sh", "-c", "pnpm dev"]
