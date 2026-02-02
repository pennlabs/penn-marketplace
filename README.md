# Penn Marketplace

A secure platform where Penn students can buy/sell items and browse/post sublet opportunities. This repo contains the full-stack application (Next.js frontend + Django backend) along with Postgres, Redis, and a fully containerized development environment.

## Architecture

**Hybrid approach:** Services (Postgres, Redis, Django, Next.js) run in Docker for consistency, but dependencies are also installed locally for IDE support (autocomplete, type checking, go-to-definition).

## 1. Requirements

### Required

- **Docker Desktop** – Run the app containers
  - macOS: `brew install --cask docker` or download from [docker.com](https://www.docker.com/products/docker-desktop)
  - Linux: Install via system package manager + docker-compose plugin
  - Windows: Download from [docker.com](https://www.docker.com/products/docker-desktop)

### Required for IDE Support & Pre-commit Hooks

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** – Python package manager
- **[pnpm](https://pnpm.io/installation)** – Node.js package manager

These install dependencies **locally** so your IDE (VSCode/Cursor) can:
- Provide autocomplete and type hints
- Resolve imports (no red squiggles)
- Run linters and formatters
- Enable go-to-definition

**The app itself runs in Docker** - you don't need Python, Node, Postgres, or Redis installed system-wide.

## 2. Clone the Repository

```bash
git clone https://github.com/pennlabs/penn-marketplace.git
cd penn-marketplace
```

## 3. One-Time Setup

```bash
make setup
```

This runs `scripts/setup.sh`, which:

1. ✅ Verifies `uv` and `pnpm` are installed
2. 📦 Installs backend Python dependencies locally → `backend/.venv/`
3. 📦 Installs frontend Node dependencies locally → `frontend/node_modules/`
4. 🪝 Installs pre-commit hooks into `.git/hooks/`

**You only need to do this once.**

### What this enables:
- **IDE tooling** works (autocomplete, type hints, import resolution)
- **Pre-commit hooks** run on your machine before commits
- **The app still runs in Docker** for consistency

## 4. Start Development Environment

### 🚀 Standard Start (with logs)
```bash
make up
```
or
```bash
docker compose up
```

### 🖥 Start in Background
```bash
make up-d
```
or
```bash
docker compose up -d
```

This will:

1. Build Docker images (if needed)
2. Start Postgres + Redis
3. Run Django migrations automatically
4. Launch services:
   - **Frontend** → http://localhost:3000
   - **Backend** → http://localhost:8000
   - **Database** → localhost:5432 (accessible with DB tools)
   - **Redis** → localhost:6379

## 5. Stopping & Resetting

### Stop containers
```bash
make down
```
or
```bash
docker compose down
```

### Full reset (⚠ deletes DB data + local deps)
```bash
make clean
```

**What `clean` does:**
- Stops and removes all containers
- **Deletes database volumes** (all data lost)
- Removes `backend/.venv/`
- Removes `frontend/node_modules/`

**Use this only when:**
- You need a completely fresh start
- Database migrations are irreversibly broken
- Dependencies are corrupted

## 6. Common Development Commands

| Task | Command |
|------|---------|
| Start dev environment | `make up-d` |
| Stop containers | `make down` |
| View logs | `make logs` |
| View logs (specific service) | `make logs-backend` or `make logs-frontend` |
| Rebuild Docker images | `make build` |
| Backend Django shell | `make shell-backend` |
| Frontend shell | `make shell-frontend` |
| Database shell | `make shell-db` |
| Run migrations | `make migrate` |
| Create migrations | `make makemigrations` |
| Run backend tests | `make test-backend` |
| Run frontend tests | `make test-frontend` |
| Generate fake data | `make generate-data` |
| Run all quality checks | `make check` |
| Auto-fix formatting | `make format` |

## 7. Working with Migrations

### When you change Django models (`models.py`):

```bash
make makemigrations  # Create migration files
make migrate         # Apply migrations
```

### When you pull changes from teammates:

```bash
make down
make up
```

**Migrations run automatically on startup**, so you don't need to run them manually when pulling.

### Reset database (nuclear option):

```bash
make down
docker volume rm penn-marketplace_postgres-data
make up
```

## 8. Installing New Packages

### Backend (Python)

**1. Add the package locally (updates `pyproject.toml` and `uv.lock`):**
```bash
cd backend
uv add
```

**2. Sync to container (picks up the updated lock file):**
```bash
docker compose exec backend uv sync
```

**That's it!** No rebuild needed. The container reads the updated `uv.lock` file.

### Frontend (Node)

**1. Add the package locally (updates `package.json` and `pnpm-lock.yaml`):**
```bash
cd frontend
pnpm add
```

**2. Sync to container (picks up the updated lock file):**
```bash
docker compose exec frontend pnpm install
```

**That's it!** No rebuild needed. The container reads the updated `pnpm-lock.yaml` file.

### Why this order?

- **Install locally first** → Updates lock files (`uv.lock`, `pnpm-lock.yaml`)
- **Sync in container** → Container picks up changes from the lock files via volume mount
- Your IDE gets autocomplete immediately
- You don't have to run the install command twice
- **No rebuild needed** because lock files are mounted into the container

### When DO you need to rebuild?

Only if you change the **Dockerfile itself** (like adding system packages or changing base image):
```bash
docker compose up --build backend   # For backend
docker compose up --build frontend  # For frontend
```

## 9. Code Quality

### Run all checks (same as CI):

```bash
make check
```
or
```bash
./scripts/check.sh
```

### Auto-fix formatting and linting:

```bash
make format
```
or
```bash
./scripts/check.sh --fix
```

### Pre-commit Hooks

Installed automatically via `make setup`.

**What they do:**
- ✨ Format Python code (ruff format)
- 🔍 Lint Python code (ruff check)
- ✨ Format JS/TS/JSON/CSS (Prettier)
- 🔍 Lint JS/TS (ESLint)
- 🔍 Check TypeScript types
- 🧹 Fix trailing whitespace

**Hooks run automatically before each commit.** If checks fail, the commit is blocked.


## 10. Accessing Services

### From your browser:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

### From database tools (TablePlus, pgAdmin, DBeaver, etc.):
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `penn_marketplace`
- **User:** `postgres`
- **Password:** `postgres`

### From Redis tools:
- **Host:** `localhost`
- **Port:** `6379`
