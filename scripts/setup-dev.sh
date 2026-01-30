#!/bin/bash
set -e

echo "🔧 Setting up local development environment for editor tooling..."

# Backend
echo ""
echo "📦 Installing Python dependencies (backend)..."
cd "$(dirname "$0")/../backend"
uv sync

# Frontend
echo ""
echo "📦 Installing Node dependencies (frontend)..."
cd "$(dirname "$0")/../frontend"
pnpm install

echo ""
echo "✅ Done! Your editor should now have full autocomplete/linting support."
echo ""
echo "To start the app, run: docker compose up"

