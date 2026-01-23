#!/bin/bash
set -e

echo "🚀 Setting up Penn Marketplace development environment..."

# Backend setup
echo "📦 Installing backend dependencies..."
cd /app
uv sync --frozen

# Run migrations
echo "🗄️ Running database migrations..."
uv run python manage.py migrate

# Create superuser if it doesn't exist (non-interactive)
echo "👤 Checking for superuser..."
uv run python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('No superuser found. Create one with: python manage.py createsuperuser')
else:
    print('Superuser already exists.')
"

# Frontend setup
echo "📦 Installing frontend dependencies..."
cd /workspace/frontend
pnpm install

echo "✅ Setup complete!"
echo ""
echo "📋 Quick Start Commands:"
echo "  Backend:  cd /app && uv run python manage.py runserver 0.0.0.0:8000"
echo "  Frontend: cd /workspace/frontend && pnpm dev"
echo "  Tests:    cd /app && uv run pytest"
echo "  Shell:    cd /app && uv run python manage.py shell"
echo ""
echo "🌐 Services:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Admin:    http://localhost:8000/admin"

