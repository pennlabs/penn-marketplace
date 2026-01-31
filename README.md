# Penn Marketplace

A secure platform where Penn students can buy/sell items and browse/post sublet opportunities. This repo contains the full-stack application (Next.js frontend + Django backend) along with Postgres, Redis, and a fully containerized development environment.


## 1. Requirements

**App runtime is Docker-first.**

You do not need Python, Node, Postgres, or Redis installed locally to run the app.

### Required for running the application

- **Docker Desktop** – Run the app containers

### Required for local code quality tooling

The following are required for pre-commit hooks (formatting, linting, type checks) as well as VSCode / IDE support (import resolution, autocomplete, type hints)

- [uv](https://docs.astral.sh/uv/getting-started/installation/) – Python package manager
- [pnpm](https://pnpm.io/installation) – Node.js package manager


## 2. Clone the Repository

```bash
git clone https://github.com/pennlabs/penn-marketplace.git
cd penn-marketplace
```

## 3. One-Time Setup (Local Machine)

```bash
make setup
```

This runs `scripts/setup.sh`, which:

1. Verifies `uv` and `pnpm` are installed
2. Installs backend Python dependencies locally → `backend/.venv/`
3. Installs frontend Node dependencies locally → `frontend/node_modules/`
4. Installs pre-commit hooks into `.git/hooks/`

You only need to do this **once**.


## 4. Start Development Environment

### 🚀 Standard Start
```bash
make up
```

### 🖥 Start in Background
```bash
make up-d
```

This will:

- Build backend & frontend Docker images (if needed)
- Start Postgres + Redis
- Run Django migrations
- Launch:
  - Frontend → http://localhost:3000
  - Backend → http://localhost:8000


## 5. Stopping & Resetting

### Stop containers
```bash
make down
```

### Full reset (⚠ deletes DB + local deps)
```bash
make clean
```

`clean` does:
- `docker compose down -v` (removes containers + volumes)
- Deletes `backend/.venv`
- Deletes `frontend/node_modules`

Use this only when things are seriously broken.

## 6. Common Dev Commands

| Task | Command |
|------|---------|
| Start dev env | `make up-d` |
| Stop containers | `make down` |
| Rebuild Docker images | `make build` |
| View logs | `make logs` |
| Backend shell | `make shell-backend` |
| Frontend shell | `make shell-frontend` |
| Run migrations | `make migrate` |
| Run backend tests | `make test` |
| Generate fake listings | `make generate-data` |


## 7. Migrations

### When you **change models** (`models.py`):

```bash
make makemigrations
make migrate
```

### When you pull changes from teammates:

```bash
make down
make up
```

Migrations run automatically on startup.


## 8. Installing New Packages

### Backend (Python • uv)

```bash
docker compose exec backend uv add <package>
make build
make up
```

### Frontend (Node • pnpm)

```bash
docker compose exec frontend pnpm add <package>
make build
make up
```

⚠ Always rebuild after dependency changes.


## 9. Code Quality

Run checks (same as CI):

```bash
./scripts/check.sh
```

Auto-fix issues:

```bash
./scripts/check.sh --fix
```

### Pre-Commit Hooks

Installed via `make setup`.

Hooks automatically:
- Format Python (ruff format)
- Lint Python (ruff)
- Format JS/TS (Prettier)
- Lint JS/TS (ESLint)
- Check TypeScript types
- Fix whitespace issues


## 10. Hot Reload

| Area | Behavior |
|------|----------|
| Frontend | Edits auto-refresh (Next.js) |
| Backend | Django auto-reloads |
