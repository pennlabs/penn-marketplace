.PHONY: setup dev up down build clean logs shell-backend shell-frontend migrate test

# Full setup: prereqs, deps, pre-commit (runs scripts/setup.sh)
# Unset VIRTUAL_ENV so uv uses the project's .venv instead of an active env
setup:
	env -u VIRTUAL_ENV ./scripts/setup.sh
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

# Run makemigrations
makemigrations:
	docker compose exec backend uv run python manage.py makemigrations

# Run migrations
migrate:
	docker compose exec backend uv run python manage.py migrate

# Run backend tests
test:
	docker compose exec backend uv run pytest

# Generate fake data
generate-data:
	docker compose exec backend uv run python manage.py generate_listings
