# Use Node.js 18 LTS
FROM node:18-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common/package.json ./packages/common/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/common ./packages/common
COPY packages/ui ./packages/ui
COPY apps/api ./apps/api

# Build production
FROM base AS production

# Expose port
EXPOSE 3000

# Start the API server
CMD ["pnpm", "--filter", "api", "start"]
