FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/api-contracts/package.json ./packages/api-contracts/
COPY configs/typescript/package.json ./configs/typescript/
COPY configs/eslint/package.json ./configs/eslint/
RUN pnpm install --frozen-lockfile --filter backend...
COPY apps/backend ./apps/backend
COPY packages/api-contracts ./packages/api-contracts
COPY configs/typescript ./configs/typescript
COPY configs/eslint ./configs/eslint
RUN pnpm install --frozen-lockfile --filter backend...
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

FROM base AS runner
WORKDIR /app/apps/backend
ENV NODE_ENV=production
ENV DATABASE_URL=file:/data/db.sqlite
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/
COPY --from=build /app/apps/backend/package.json ./package.json
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/prisma ./prisma
COPY --from=build /app/apps/backend/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/apps/backend/src/infrastructure/database ./src/infrastructure/database
COPY --from=build /app/packages/api-contracts /app/packages/api-contracts
COPY --from=build /app/configs/typescript /app/configs/typescript
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/backend/node_modules ./node_modules
RUN mkdir -p /data
EXPOSE 8080
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm exec prisma db seed && node dist/main"]
