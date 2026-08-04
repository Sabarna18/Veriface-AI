#!/usr/bin/env bash

set -Eeuo pipefail

# ==========================================================
# VeriFace AI Backend Verification
# ==========================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"

GREEN='\033[0;32m'
BLUE='\033[1;34m'
RED='\033[0;31m'
NC='\033[0m'

ORIGINAL_ENV_EXISTS=false

cleanup() {
    cd "${BACKEND_DIR}"

    rm -f .env

    if [[ "${ORIGINAL_ENV_EXISTS}" == "true" && -f .env.backup ]]; then
        mv -f .env.backup .env
    fi
}

trap cleanup EXIT

echo ""
echo "=========================================================="
echo "         VeriFace AI Backend Verification"
echo "=========================================================="
echo ""

# ==========================================================
# Preconditions
# ==========================================================

command -v uv >/dev/null 2>&1 || {
    echo -e "${RED}uv not found in PATH.${NC}"
    exit 1
}

cd "${BACKEND_DIR}"

[[ -f pyproject.toml ]] || { echo "pyproject.toml not found."; exit 1; }
[[ -f uv.lock ]] || { echo "uv.lock not found."; exit 1; }
[[ -f .env.ci ]] || { echo ".env.ci not found."; exit 1; }

# ==========================================================
# Backup developer environment
# ==========================================================

if [[ -f .env ]]; then
    ORIGINAL_ENV_EXISTS=true
    cp .env .env.backup
fi

# ==========================================================
# General checks (real environment)
# ==========================================================

echo -e "${BLUE}[1/8] Python version...${NC}"
uv run python --version

echo -e "${BLUE}[2/8] Synchronizing dependencies...${NC}"
uv sync --frozen --extra dev

echo -e "${BLUE}[3/8] Ruff lint...${NC}"
uv run ruff check .

echo -e "${BLUE}[4/8] Ruff formatting...${NC}"
uv run ruff format --check .

# ==========================================================
# Switch to CI environment for tests
# ==========================================================

echo -e "${BLUE}[5/8] Running backend tests...${NC}"

rm -f .env
cp .env.ci .env

uv run pytest -v

# ==========================================================
# Restore developer environment
# ==========================================================

if [[ "${ORIGINAL_ENV_EXISTS}" == "true" ]]; then
    rm -f .env
    mv -f .env.backup .env

    # recreate backup for cleanup trap
    cp .env .env.backup
fi

# ==========================================================
# Real database validation
# ==========================================================

echo -e "${BLUE}[6/8] Alembic migration validation...${NC}"
uv run alembic check

echo -e "${BLUE}[7/8] Database summary...${NC}"
uv run python scripts/db_summary.py

echo -e "${BLUE}[8/8] Environment restoration...${NC}"
echo "Developer environment verified."

echo ""
echo "=========================================================="
echo -e "${GREEN}✓ Backend verification completed successfully.${NC}"
echo "=========================================================="
echo ""