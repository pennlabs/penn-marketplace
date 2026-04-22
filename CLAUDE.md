# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Penn Marketplace is a full-stack platform for Penn students to buy/sell items and browse/post sublets. It uses a **hybrid Docker development approach**: services (Postgres, Redis, Django, Next.js) run in Docker, but dependencies are also installed locally for IDE support.

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL 15.8, **Cache**: Redis
- **Auth**: Penn Platform OIDC via `django-labs-accounts` (backend) and `jose` JWT handling (frontend)

## Commands

### Development (Docker)

```bash
make setup          # One-time: install local deps + pre-commit hooks
make up             # Start all containers (frontend :3000, backend :8000)
make up-d           # Start in background
make down           # Stop containers
make logs           # View all container logs
```

### Frontend (from `frontend/`, package manager: pnpm)

```bash
pnpm dev            # Dev server with Turbopack
pnpm check          # Run all checks: lint + typecheck + format:check
pnpm fix            # Auto-fix: lint:fix + format
pnpm lint           # ESLint only
pnpm typecheck      # TypeScript only (tsc --noEmit)
pnpm format         # Prettier only
```

### Backend (from `backend/`, package manager: uv)

```bash
uv run pytest                               # Run tests
uv run ruff check .                         # Lint
uv run ruff format .                        # Format
make migrate                                # Apply migrations (via Docker)
make makemigrations                         # Create migrations (via Docker)
make test                                   # Run pytest via Docker
make generate-data                          # Generate fake listings
```

### CI Checks (must pass before merge)

Backend: `uv run ruff check .` + `uv run ruff format .`
Frontend: `pnpm lint` + `pnpm typecheck`

Run `./scripts/check.sh` locally to match CI. Pre-commit hooks auto-fix on commit.

## Architecture

### Frontend (`frontend/`)

- **App Router**: Pages in `app/`, with `items/`, `sublets/`, `create/` routes
- **Server Actions** (`lib/actions.ts`): All API calls go through `serverFetch<T>()` which handles auth headers from cookies. This is the main data-fetching layer.
- **TanStack Query**: Client-side caching/refetching via `providers/TanstackQueryProvider.tsx`
- **Form handling**: React Hook Form + Zod schemas (`lib/validations.ts`)
- **Middleware** (`middleware.ts`): OIDC token refresh and auth redirects
- **UI primitives**: shadcn/ui components in `components/ui/` (built on Radix UI)
- **Types**: All API response types in `lib/types.ts`
- **Constants**: Environment variables and app constants in `lib/constants.ts`

### Backend (`backend/`)

- **Single Django app** (`market/`): models, views, serializers, permissions, urls
- **Config**: Split settings in `config/settings/` (base, development, production)
- **Models**: `User` (extends AbstractUser), `Listing` (base), `Item` and `Sublet` (inherit from Listing), `ListingImage`, `Offer`, `Category`, `Tag`
- **Views**: DRF ViewSets (`Listings`, `Offers`, `Favorites`) and function-based views for user/phone endpoints
- **URL prefix**: All market endpoints under `/market/` (listings, offers, favorites, tags, phone verification, user)
- **Tests**: `tests/market/test_market.py` using pytest + DRF's APIClient

### API Pattern

REST JSON API with offset/limit pagination. Endpoints return `{ count, next, previous, results }`. Auth via `Authorization: Bearer <token>` header (set automatically by server actions).

## Key Conventions

### Frontend
- Strict TypeScript (`"strict": true`) — avoid `any`
- Prettier: 100 char width, 2 spaces, semicolons, Tailwind class sorting plugin
- Server Components by default; use `"use client"` only when needed
- Component composition: Page → Filters → Grid → Card

### Backend
- Ruff for linting + formatting (88 char width, double quotes, isort with 2 blank lines after imports)
- Excluded from ruff: `migrations/`, `.venv/`
- Migrations are auto-applied on Docker startup

### Installing New Packages

**Frontend**: `cd frontend && pnpm add <pkg>`, then `docker compose exec frontend pnpm install`
**Backend**: `cd backend && uv add <pkg>`, then `docker compose exec backend uv sync`

No Docker rebuild needed — lock files are volume-mounted.
