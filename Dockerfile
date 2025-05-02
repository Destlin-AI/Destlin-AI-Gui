# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0
ARG PNPM_VERSION=10.4.1

# Base image with Node and Corepack
FROM node:${NODE_VERSION} AS base
RUN --mount=type=cache,target=/root/.npm \
    npm install --global corepack@latest
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

# Builder stage: install deps and build
FROM base AS builder
WORKDIR /app
COPY --link package.json pnpm-lock.yaml ./
# Install dependencies with pnpm cache
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV PNPM_STORE_DIR=/root/.pnpm-store
RUN --mount=type=cache,target=${PNPM_STORE_DIR} \
    pnpm install --frozen-lockfile
# Copy the rest of the source code
COPY --link . .
# Build the Next.js app (TypeScript compilation included)
RUN pnpm run build

# Production image
FROM node:${NODE_VERSION}-slim AS final
RUN --mount=type=cache,target=/root/.npm \
    npm install --global corepack@latest
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app
# Create non-root user
RUN addgroup --system --gid 1001 appgroup && adduser --system --uid 1001 --ingroup appgroup appuser
# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/tailwind.config.{js,ts,mjs,cjs}* ./  # If present
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/contexts ./contexts
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/lib ./lib
# Set environment and permissions
ENV NODE_ENV=production
EXPOSE 3000
USER appuser
CMD ["pnpm", "start"]
