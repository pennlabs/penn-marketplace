#!/bin/bash

# =============================================================================
# Code Quality Check Script for Penn Marketplace
# =============================================================================
# Runs linting and formatting checks (same as CI).
# Note: Tests are NOT run here - they run in CI only.
#
# Usage:
#   ./scripts/check.sh           # Run all checks
#   ./scripts/check.sh frontend  # Run frontend checks only
#   ./scripts/check.sh backend   # Run backend checks only
#   ./scripts/check.sh --fix     # Run checks with auto-fix where possible
#
# This checks linting/formatting before pushing.
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

# Parse arguments
FIX_MODE=false
CHECK_FRONTEND=true
CHECK_BACKEND=true

for arg in "$@"; do
    case $arg in
        --fix)
            FIX_MODE=true
            ;;
        frontend)
            CHECK_BACKEND=false
            ;;
        backend)
            CHECK_FRONTEND=false
            ;;
    esac
done

# Track failures
FAILED=0

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "${YELLOW}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# =============================================================================
# Frontend Checks
# =============================================================================

run_frontend_checks() {
    print_header "Frontend Checks (Next.js + TypeScript)"

    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm not found. Install it: https://pnpm.io/installation"
        return 1
    fi

    cd frontend

    local failed=0

    # 1. ESLint (matches CI: pnpm lint)
    print_step "Running ESLint..."
    if [ "$FIX_MODE" = true ]; then
        if pnpm lint:fix; then
            print_success "ESLint fixed"
        else
            print_error "ESLint failed"
            failed=1
        fi
    else
        if pnpm lint; then
            print_success "ESLint OK"
        else
            print_error "ESLint found issues"
            echo "  Run: cd frontend && pnpm lint:fix"
            failed=1
        fi
    fi

    # 2. TypeScript type check
    print_step "Running TypeScript type check..."
    if pnpm typecheck; then
        print_success "TypeScript OK"
    else
        print_error "TypeScript type errors found"
        failed=1
    fi

    cd ..
    return $failed
}

# =============================================================================
# Backend Checks
# =============================================================================

run_backend_checks() {
    print_header "Backend Checks (Django + Python)"

    if ! command -v uv &> /dev/null; then
        print_error "uv not found. Install it: https://docs.astral.sh/uv/getting-started/installation/"
        return 1
    fi

    cd backend

    local failed=0

    # 1. Ruff check (matches CI: uv run ruff check .)
    print_step "Running ruff check..."
    if [ "$FIX_MODE" = true ]; then
        if uv run ruff check --fix .; then
            print_success "Ruff check fixed"
        else
            print_error "Ruff check failed"
            failed=1
        fi
    else
        if uv run ruff check .; then
            print_success "Ruff check OK"
        else
            print_error "Ruff found linting issues"
            echo "  Run: cd backend && uv run ruff check --fix ."
            failed=1
        fi
    fi

    # 2. Ruff format (matches CI: uv run ruff format .)
    # Note: CI runs ruff format (formats), not --check
    print_step "Running ruff format..."
    if [ "$FIX_MODE" = true ]; then
        if uv run ruff format .; then
            print_success "Ruff format fixed"
        else
            print_error "Ruff format failed"
            failed=1
        fi
    else
        # In check mode, we use --check to see if formatting is needed
        # But CI actually formats, so this is a local-only check
        if uv run ruff format --check .; then
            print_success "Ruff format OK"
        else
            print_error "Ruff found formatting issues"
            echo "  Run: cd backend && uv run ruff format ."
            failed=1
        fi
    fi


    cd ..
    return $failed
}

# =============================================================================
# Main
# =============================================================================

print_header "Penn Marketplace - Code Quality Check (lint & format)"
echo ""
echo -e "${BLUE}ℹ${NC} This runs linting and formatting checks (same as CI)."
echo -e "${BLUE}ℹ${NC} Backend: ruff check, ruff format"
echo -e "${BLUE}ℹ${NC} Frontend: lint (pnpm), typecheck (TypeScript)"
echo -e "${BLUE}ℹ${NC} Note: Tests are not run here (they run in CI)."
echo -e "${BLUE}ℹ${NC} Mode: $([ "$FIX_MODE" = true ] && echo '--fix (auto-fix enabled)' || echo 'check only')"
echo ""

if [ "$CHECK_FRONTEND" = true ]; then
    if ! run_frontend_checks; then
        FAILED=1
    fi
fi

if [ "$CHECK_BACKEND" = true ]; then
    if ! run_backend_checks; then
        FAILED=1
    fi
fi

# Summary
print_header "Summary"

if [ $FAILED -eq 0 ]; then
    print_success "All linting and formatting checks passed!"
    echo ""
    echo -e "${BLUE}ℹ${NC} Note: Tests are not run here. They run in CI."
    echo ""
    exit 0
else
    print_error "Some checks failed."
    echo ""
    echo -e "${YELLOW}To auto-fix what can be fixed:${NC}"
    echo "  ./scripts/check.sh --fix"
    echo ""
    echo -e "${YELLOW}Or fix manually:${NC}"
    echo "  Frontend: cd frontend && pnpm lint:fix"
    echo "  Backend:  cd backend && uv run ruff check --fix . && uv run ruff format ."
    echo ""
    exit 1
fi
