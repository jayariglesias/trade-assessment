# 📊 Trade Blotter

A simple trading blotter app where you can create, view, update, and cancel trades in real time.

You do **not** need to be a developer to follow this guide. Pick one path below and go step by step.

| Path | Best for | Time |
|------|----------|------|
| [Option A: Local with pnpm](#-option-a--run-locally-with-pnpm) | Day-to-day coding | ~5 minutes |
| [Option B: Docker](#-option-b--run-with-docker) | Trying the app quickly | ~5-10 minutes |

---

## 🌐 What you get

| App | URL | What it is |
|-----|-----|------------|
| Frontend | [http://localhost:3000](http://localhost:3000) | The website you use in the browser |
| Backend API | [http://localhost:3001](http://localhost:3001) | The server that stores trades |
| API docs | [http://localhost:3001/api](http://localhost:3001/api) | Interactive API reference (Swagger) |

---

## 🛠️ Tech stack

| Layer | Tools |
|-------|--------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4, Socket.IO Client |
| Backend | NestJS, Prisma, SQLite, Socket.IO, Swagger / OpenAPI |
| Monorepo | pnpm workspaces, Turborepo |
| Shared | `@shared/api-contracts` (OpenAPI schema, DTO types, typed API client) |
| Runtime | Node.js 18+, Docker (optional) |

---

## 📦 Before you start

### Option A needs

1. **Node.js 18 or newer** - [Download Node.js](https://nodejs.org/)
2. **pnpm** - after Node is installed, open a terminal and run:

```bash
npm install -g pnpm
```

### Option B needs

1. **Docker Desktop** - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Make sure Docker Desktop is **running** (whale icon in the system tray / menu bar)

---

## 🚀 Option A - Run locally with pnpm

### Step 1 - Open the project folder

In a terminal:

```bash
cd path/to/trade-assessment
```

### Step 2 - Install dependencies

```bash
pnpm install
```

Wait until it finishes. This downloads everything the app needs.

### Step 3 - Set up environment files

Copy the example env files (only needed once):

**Backend** (`apps/backend/.env`):

```env
PORT=3001
DATABASE_URL="file:./db.sqlite"
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`apps/frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Or copy from the examples:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

> On Windows PowerShell you can use `Copy-Item` instead of `cp`.

### Step 4 - Set up the database

```bash
pnpm db:migrate
pnpm db:seed
```

- `db:migrate` creates the database tables
- `db:seed` adds sample trades so the blotter is not empty

### Step 5 - Start the app

```bash
pnpm run dev
```

This starts **both** the frontend and the backend together.

### Step 6 - Open it in your browser

Go to: **[http://localhost:3000](http://localhost:3000)**

You should see the trade blotter. Changes update live via WebSockets.

### Stop the local app

Press `Ctrl + C` in the terminal.

If ports stay busy:

```bash
pnpm kill-ports
```

---

## 🐳 Option B - Run with Docker

No Node.js or pnpm required. Docker builds and runs everything for you.

### Step 1 - Open the project folder

```bash
cd path/to/trade-assessment
```

### Step 2 - Make sure Docker Desktop is running

Open Docker Desktop and wait until it says it is ready.

### Step 3 - Build and start

```bash
docker compose up --build
```

The first run can take a few minutes while images build. Later starts are faster.

### Step 4 - Open it in your browser

Go to: **[http://localhost:3000](http://localhost:3000)**

| Service | Port |
|---------|------|
| Frontend | `3000` |
| Backend | `3001` |

The database lives in a Docker volume (`sqlite_data`), so trades persist between restarts.

### Stop Docker

Press `Ctrl + C`, then optionally clean up:

```bash
docker compose down
```

To also remove the saved database volume:

```bash
docker compose down -v
```

---

## 🔧 Handy commands (local)

| Command | What it does |
|---------|----------------|
| `pnpm run dev` | Start frontend + backend in development |
| `pnpm build` | Build everything for production |
| `pnpm test` | Run tests |
| `pnpm lint` | Check code style |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Load sample trades |
| `pnpm kill-ports` | Free ports `3000` and `3001` |
| `pnpm generate:api` | Regenerate OpenAPI schema and client from Nest DTOs |

---

## API types

REST request and response shapes come from the backend OpenAPI spec, not hand-written frontend types.

| Package | Role |
|---------|------|
| `@shared/api-contracts` | Generated schema, `TradeDto` / `CreateTradeDto` / `UpdateTradeDto`, and typed `createApiClient` |

After changing Nest DTOs, run:

```bash
pnpm generate:api
```

Frontend imports look like:

```ts
import type { CreateTradeDto, TradeDto } from "@shared/api-contracts";
```

---

## Deploy with Docker (Railway or similar)

This repo has two Dockerfiles. Use the **repo root** as build context for both services.

| Service | Dockerfile path | Railway config file |
|---------|-----------------|---------------------|
| Backend | `apps/backend/Dockerfile` | `apps/backend/railway.toml` |
| Frontend | `apps/frontend/Dockerfile` | `apps/frontend/railway.toml` |

In each Railway service, open **Settings** and set **Config file path** to the matching `railway.toml`. Keep **root directory** as the repo root.

**Backend env**

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `file:/data/db.sqlite` |
| `CORS_ORIGIN` | `https://your-frontend.up.railway.app` |

Do **not** set `PORT`. Railway injects it automatically.

Mount a volume at `/data` so SQLite survives redeploys.

**Frontend build args**

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | backend public URL |
| `NEXT_PUBLIC_SOCKET_URL` | same backend URL |

Local Docker Compose already wires these defaults:

```bash
docker compose up --build
```

---

## 📁 Project layout

```text
trade-assessment/
├── apps/
│   ├── backend/     # NestJS API + Prisma + WebSockets
│   └── frontend/    # Next.js UI
├── packages/
│   └── api-contracts/   # OpenAPI schema, typed client, and DTO types
├── configs/         # Shared ESLint + TypeScript configs
├── AI_USAGE_REPORT.md
├── docker-compose.yml
└── package.json
```

---

## 🐛 Troubleshooting

**Port already in use**

```bash
pnpm kill-ports
```

Then run `pnpm run dev` again.

**Frontend loads but no data**

1. Confirm the backend is running on port `3001`
2. Check `apps/frontend/.env.local` points to `http://localhost:3001`
3. Try seeding again: `pnpm db:seed`

**Docker build fails**

1. Confirm Docker Desktop is running
2. Retry: `docker compose up --build`
3. If needed, reset containers: `docker compose down` then build again

**pnpm not found**

```bash
npm install -g pnpm
```

---

## License

Private assessment project.
