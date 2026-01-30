#!/bin/bash

# =============================================================================
# Development Setup Script for Penn Marketplace
# =============================================================================
# Run this once after cloning the repository to set up your local environment.
#
# Usage: ./scripts/setup.sh
#
# What this does:
#   1. Installs pre-commit hooks (for commit-time formatting/linting)
#   2. Verifies your local tools are installed
#   3. Shows next steps
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}Penn Marketplace - Development Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get repo root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$REPO_ROOT" ]; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi
cd "$REPO_ROOT"

# =============================================================================
# Check prerequisites
# =============================================================================

echo -e "${YELLOW}Checking prerequisites...${NC}"
echo ""

MISSING_TOOLS=()

# Check for uv (required for backend)
if command -v uv &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} uv found: $(uv --version)"
else
    echo -e "  ${RED}✗${NC} uv not found"
    MISSING_TOOLS+=("uv")
fi

# Check for pnpm (required for frontend)
if command -v pnpm &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} pnpm found: $(pnpm --version)"
else
    echo -e "  ${RED}✗${NC} pnpm not found"
    MISSING_TOOLS+=("pnpm")
fi

# Check for Docker (optional but recommended)
if command -v docker &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} docker found"
else
    echo -e "  ${YELLOW}⚠${NC} docker not found (optional, needed for full dev environment)"
fi

echo ""

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo -e "${RED}Missing required tools: ${MISSING_TOOLS[*]}${NC}"
    echo ""
    echo "Install them:"
    for tool in "${MISSING_TOOLS[@]}"; do
        case $tool in
            uv)
                echo "  uv:   curl -LsSf https://astral.sh/uv/install.sh | sh"
                ;;
            pnpm)
                echo "  pnpm: curl -fsSL https://get.pnpm.io/install.sh | sh"
                ;;
        esac
    done
    echo ""
    echo "Then re-run: ./scripts/setup.sh"
    exit 1
fi

# =============================================================================
# Install dependencies
# =============================================================================

echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
uv sync
cd ..
echo -e "  ${GREEN}✓${NC} Backend dependencies installed"
echo ""

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
pnpm install
cd ..
echo -e "  ${GREEN}✓${NC} Frontend dependencies installed"
echo ""

# =============================================================================
# Install pre-commit hooks
# =============================================================================

echo -e "${YELLOW}Installing pre-commit hooks...${NC}"
cd backend
uv run pre-commit install
cd ..
echo -e "  ${GREEN}✓${NC} Pre-commit hooks installed"
echo ""

# =============================================================================
# Done!
# =============================================================================

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "What's installed:"
echo "  • Pre-commit hooks: Run automatically on 'git commit'"
echo "    - Formats code (ruff format, Prettier)"
echo "    - Lints code (ruff, ESLint)"
echo ""
echo "Next steps:"
echo "  1. Start the dev environment:  docker compose up"
echo "  2. Run full checks (like CI):  ./scripts/check.sh"
echo "  3. Auto-fix issues:            ./scripts/check.sh --fix"
echo ""
echo -e "${BLUE}ℹ${NC} CI is the source of truth. Hooks are optional but helpful."
echo -e "${BLUE}ℹ${NC} Always run './scripts/check.sh' before pushing to verify."
echo ""
