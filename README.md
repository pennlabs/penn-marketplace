# Penn Marketplace

A secure platform where Penn students can buy/sell items and browse/post sublet opportunities. This repo contains the full-stack application (Next.js frontend + Django backend) along with Postgres, Redis, and a fully containerized development environment.

## 1. Requirements

This project uses **Docker** for the entire development environment.

Install:

- Docker Desktop  
- Git  

You **do not** need Python, Node, Postgres, or Redis installed locally.

### Environment Variables

You will need environment variable files for both the backend and frontend:

- `backend/.env`
- `frontend/.env`

Make sure these files are configured before running the application. If you are a member of PennLabs, you can
reach out to one of them for the credentials.

## 2. Clone the Repository

```bash
git clone https://github.com/pennlabs/penn-marketplace.git
cd penn-marketplace
```


## 3. Start the Development Environment

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


## 4. Generating Test Data (optional)
TODO


## 5. Hot Reload

### Frontend (Next.js)

- Edit files in `frontend/`  
- Next.js refreshes automatically  

### Backend (Django)

- Edit files in `backend/`  
- Django dev server auto-reloads  


## 6. Running Migrations

Always run migrations *inside Docker*.

Create:

```bash
docker compose exec backend python manage.py makemigrations
```

Apply:

```bash
docker compose exec backend python manage.py migrate
```

> ⚠️ **Do NOT use `pipenv run` for migrations.**  
> Django + Postgres run inside Docker, so migrations must run in the container.


## 7. Installing New Packages

### Backend (Python • Pipenv)

Install locally:

```bash
cd backend
pipenv install <package>
cd ..
```

Rebuild & restart:

```bash
docker compose build backend
docker compose up
```

### Frontend (Node • pnpm)

Install locally:

```bash
cd frontend
pnpm add <package>
cd ..
```

Rebuild & restart:

```bash
docker compose build frontend
docker compose up
```


## Note on Pipenv (Upcoming Migration to Poetry)

The backend currently uses **Pipenv**, but it can be confusing in a Docker-based workflow because:

- Pipenv manages virtual environments, but Docker already provides isolation  
- Pipenv behaves differently inside vs outside containers  
- Developers may be unsure whether to run commands via Pipenv or Docker  
- The Python ecosystem is moving toward `pyproject.toml`

We plan to migrate to **Poetry** (at some point lol), which integrates cleanly with Docker, avoids virtualenv confusion, and matches modern Python practices.
