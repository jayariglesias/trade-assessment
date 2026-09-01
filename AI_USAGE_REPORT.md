# AI Usage Report

How Cursor AI was used while building this trade blotter assessment. This note covers only decisions that shipped in the final codebase.

**Tool:** Cursor (Composer / Agent)  
**Role:** Pair-programming assistant under human direction  
**Date:** 1 September 2026

---

## What AI helped with

| Area | Outcome |
|------|---------|
| Monorepo layout | `apps/backend`, `apps/frontend`, shared packages under `packages/` |
| Backend shape | NestJS modules, Prisma + SQLite, use-case folders per trade action |
| Real-time | Socket.IO gateway on mutate; frontend hook patches blotter state in place |
| Shared contracts | `@shared/api-contracts` OpenAPI schema, DTO types, and typed API client |
| Frontend UI | Next.js App Router, Tailwind, blotter table + entry modal |
| Component folders | `components/common`, `features`, `layouts`, `modals` |
| Ops | `docker-compose.yml`, seed script, README run paths (pnpm + Docker) |

Human review and direction applied throughout. AI drafted and refactored; stack choices and product scope stayed with the author.

---

## Decisions AI influenced (kept)

### 1. NestJS + Prisma + SQLite

Aligned with the assessment stack and with patterns from my personal hobby project. Prisma owns the schema; Nest use-cases own create / list / get / update / cancel.

### 2. Cancel as a status change

Cancel sets `status` to `CANCELLED` instead of deleting the row. Matches the required lifecycle and keeps history visible in the blotter.

### 3. Shared api-contracts package

`Trade` and input types come from `@shared/api-contracts`, generated from the backend OpenAPI spec. The frontend uses the same package for DTO types and the typed `createApiClient`.

### 4. Socket events patch local state

After the first list load, create / amend / cancel updates arrive over Socket.IO and update the table without a full refetch.

### 5. Next.js over a Vite SPA

An early Vite-style frontend path was dropped. Next.js App Router + Tailwind matches the preferred frontend stack and keeps routing simple (`/` → home blotter).

### 6. Component folder split

UI is grouped by role (`common`, `features`, `layouts`, `modals`) so blotter pieces stay easy to find without deep nesting.

---

## What was not kept

Early Express scaffolding and leftover Vite setup were removed once NestJS + Next.js were confirmed. Extra complexity that did not help the blotter was cut rather than documented here.

---

## Human vs AI

| Human | AI |
|-------|----|
| Requirements, stack lock, acceptance of trade-offs | Scaffolding, boilerplate, refactors |
| Product UX direction and polish priorities | Table / form / modal wiring |
| Final review of architecture and README tone | Tests, seed data, Docker wiring drafts |

AI did not invent the product. It accelerated implementation of a fixed NestJS + Next.js + Socket.IO + Prisma design.
