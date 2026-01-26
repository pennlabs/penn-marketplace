# Penn Marketplace

A secure platform where Penn students can buy/sell items and browse/post sublet opportunities. This repo contains the full-stack application (Next.js frontend + Django backend) along with Postgres, Redis, and a fully containerized development environment.

## 1. Requirements

**App runtime is Docker-first.**

You do not need Python, Node, Postgres, or Redis installed locally to run the app.

### Required for Development

- **Docker Desktop** - For running the app
- **Git** - Version control

### Recommended for Local Development

We use pre-commit hooks to automatically run formatters, linters, and type checks before every commit.
To use them, you must install these tools locally:

- [uv](https://docs.astral.sh/uv/getting-started/installation/) - Python package manager
- [pnpm](https://pnpm.io/installation) - Node.js package manager

### Environment Variables

You will need environment variable files for both the backend and frontend:

- `backend/.env`
- `frontend/.env`

Make sure these files are configured before running the application. If you are a member of PennLabs, you can reach out to one of them for the credentials.

## 2. Clone the Repository

```bash
git clone https://github.com/pennlabs/penn-marketplace.git
cd penn-marketplace
```

## 3. Setup (One Time)

**Run this on your local machine (not in Docker):**

```bash
./scripts/setup.sh
```

**What this does:**
1. Checks if you have `uv` and `pnpm` installed locally
2. Installs backend Python dependencies locally (creates `backend/.venv/`)
3. Installs frontend Node dependencies locally (creates `frontend/node_modules/`)
4. Installs pre-commit hooks in your local `.git/hooks/` directory

**Note:** If you don't have `uv` or `pnpm` installed locally, the script will tell you how to install them.

## 4. Start the Development Environment

```bash
docker compose up --build
```

This will:

- Build backend & frontend Docker images
- Start Postgres + Redis
- Run Django migrations
- Launch:
  - Frontend → http://localhost:3000
  - Backend → http://localhost:8000

Stop:

```bash
Ctrl + C
docker compose down
```

Remove DB/storage volumes:

```bash
docker compose down -v
```

## 5. Code Quality

### Running Checks

You can run the full check script by:

```bash
./scripts/check.sh
```

To auto-fix formatting issues:

```bash
./scripts/check.sh --fix
```

### What Gets Checked

| Area | Checks |
|------|--------|
| **Frontend** | Lint (pnpm), TypeScript typecheck |
| **Backend** | ruff check, ruff format |

### Pre-Commit Hooks

If you ran `./scripts/setup.sh`, pre-commit hooks are installed. They automatically format and lint your code when you run `git commit`.

**What hooks do:**
- Auto-fix Python code formatting (ruff format)
- Auto-fix Python code linting (ruff check --fix)
- Auto-fix TypeScript/JavaScript code formatting (Prettier)
- Auto-fix TypeScript/JavaScript code linting (ESLint --fix)
- Check TypeScript types (pnpm typecheck)
- Auto-fix trailing whitespace, file endings

**Note:** Hooks auto-fix issues when possible. TypeScript type checking can't be auto-fixed, so the commit is blocked if there are type errors.

## 6. Generating Test Data (optional)

To populate the database with random sample listings for testing:
```bash
docker compose exec backend python manage.py generate_listings
```

This command will:
- Create 25 random marketplace items and sublets
- Generate a test user (`testuser` / `testpassword123`) if one doesn't exist
- Assign random prices, conditions, and expiration dates to all listings

Use this to quickly test the marketplace UI and features with realistic data.

**Note:** Make sure `docker compose up` is running before executing this command, as you need the backend container and database to be active.

## 7. Hot Reload

### Frontend (Next.js)

- Edit files in `frontend/`
- Next.js refreshes automatically

### Backend (Django)

- Edit files in `backend/`
- Django dev server auto-reloads


## 8. Running Migrations

### When YOU change models in `models.py`:

Run both commands:
```bash
# Step 1: Create migration file
docker compose exec backend python manage.py makemigrations

# Step 2: Apply to database
docker compose exec backend python manage.py migrate
```

### When you pull code from teammates:

Just restart containers:
```bash
docker compose down
docker compose up
```

Migrations are applied automatically on startup.

> ⚠️ **You must run BOTH commands when changing models.**
> `makemigrations` creates the migration file, `migrate` applies it to the database.



## 9. Installing New Packages

### Backend (Python • uv)

The backend uses **uv** for fast, reliable Python dependency management.

**Option 1: Edit pyproject.toml manually**

1. Add package to `backend/pyproject.toml`:
```toml
   dependencies = [
       "django>=4.2",
       "your-new-package>=1.0.0",  # ← Add here
   ]
```

2. Update lockfile & rebuild:
```bash
   docker compose exec backend uv lock
   docker compose build backend
   docker compose up
```

**Option 2: Use uv inside Docker**
```bash
docker compose exec backend uv add <package>
docker compose build backend
docker compose up
```

**Option 3: Use uv CLI (if you have uv installed locally)**
```bash
cd backend
uv add <package>
cd ..
docker compose build backend
docker compose up
```

> ⚠️ **Always rebuild after changing dependencies.**
> The `uv.lock` file must be synchronized with your Docker image.

### Frontend (Node • pnpm)

**Option 1: Edit package.json manually**

1. Add package to `frontend/package.json`
2. Update lockfile & rebuild:
```bash
   docker compose exec frontend pnpm install
   docker compose build frontend
   docker compose up
```

**Option 2: Use pnpm inside Docker**
```bash
docker compose exec frontend pnpm add <package>
docker compose build frontend
docker compose up
```

**Option 3: Use pnpm CLI (if installed locally)**
```bash
cd frontend
pnpm add <package>
cd ..
docker compose build frontend
docker compose up
```
