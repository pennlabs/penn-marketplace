.PHONY: setup dev up down build clean logs shell-backend shell-frontend migrate test

# Install local dependencies for editor tooling
setup:
	@echo "📦 Installing backend dependencies..."
	cd backend && uv sync
	@echo "📦 Installing frontend dependencies..."
	cd frontend && pnpm install
	@echo "✅ Setup complete! Run 'make dev' to start."

# Full dev setup: install deps + start containers
dev: setup up

# Start all containers
up:
	docker compose up

# Start in background
up-d:
	docker compose up -d

# Stop all containers
down:
	docker compose down

# Rebuild containers
build:
	docker compose build

# Remove containers, volumes, and local deps
clean:
	docker compose down -v
	rm -rf backend/.venv
	rm -rf frontend/node_modules

# View logs
logs:
	docker compose logs -f

# Shell into backend container
shell-backend:
	docker compose exec backend bash

# Shell into frontend container
shell-frontend:
	docker compose exec frontend sh

# Run migrations
migrate:
	docker compose exec backend uv run python manage.py migrate

# Run backend tests
test:
	docker compose exec backend uv run pytest

# Generate fake data
generate-data:
	docker compose exec backend uv run python manage.py generate_listings

