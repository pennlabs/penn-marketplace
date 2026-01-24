#!/bin/bash
set -e

echo "🔄 Starting development services..."

# Check if database is ready
echo "⏳ Waiting for database..."
cd /app
until uv run python manage.py check --database default 2>/dev/null; do
  echo "  Database not ready, retrying..."
  sleep 2
done
echo "✅ Database is ready!"

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "Start the backend server with:"
echo "  cd /app && uv run python manage.py runserver 0.0.0.0:8000"
echo ""
echo "Frontend is running at http://localhost:3000"
echo "Backend API will be at http://localhost:8000"

