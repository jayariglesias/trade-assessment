FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/api-contracts/package.json ./packages/api-contracts/
RUN pnpm install --frozen-lockfile --filter frontend...
COPY apps/frontend ./apps/frontend
COPY packages ./packages
RUN mkdir -p apps/frontend/public
RUN pnpm install --frozen-lockfile --filter frontend...
RUN pnpm --filter frontend build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=build /app/apps/frontend/public ./apps/frontend/public
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
