# ─────────────────────────────────────────────────────────────────────────────
# JurisAI — Next.js Frontend
# Uses Next.js standalone output for a minimal production image (~300 MB)
# Target: Render Web Service
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: dependency installer ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies — copy lock files first for layer-cache efficiency
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Use npm ci for reproducible installs; fall back to npm install if no lock file
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi


# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy installed modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Build-time env vars (public ones only — these get baked into the JS bundle)
# Override on Render's dashboard under Environment → Build-time variables
ARG NEXT_PUBLIC_API_URL=https://legal24-api.onrender.com
ARG NEXT_PUBLIC_WS_URL=wss://legal24-api.onrender.com
ARG NEXT_PUBLIC_APP_URL=https://legal24.onrender.com
ARG NEXT_PUBLIC_CASHFREE_ENV=production

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_CASHFREE_ENV=$NEXT_PUBLIC_CASHFREE_ENV
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app — produces .next/standalone thanks to output: 'standalone'
RUN npm run build


# ── Stage 3: runtime (minimal) ────────────────────────────────────────────────
FROM node:20-alpine AS runtime

RUN apk add --no-cache dumb-init

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

WORKDIR /app

# Copy only the standalone server + required public assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

USER nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Render injects PORT at runtime
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# dumb-init ensures proper signal forwarding (clean shutdown on Render deploys)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["dumb-init", "node", "server.js"]
