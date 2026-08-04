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

    if [[ "${ORIGINAL_ENV_EXISTS}" == "true" ]]; then
        rm -f .env
        mv -f .env.backup .env
    else
        rm -f .env
        rm -f .env.backup
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

[[ -f pyproject.toml ]] || {
    echo -e "${RED}pyproject.toml not found.${NC}"
    exit 1
}

[[ -f uv.lock ]] || {
    echo -e "${RED}uv.lock not found.${NC}"
    exit 1
}

[[ -f .env.ci ]] || {
    echo -e "${RED}.env.ci not found.${NC}"
    exit 1
}

# ==========================================================
# Preserve developer environment
# ==========================================================

if [[ -f .env ]]; then
    ORIGINAL_ENV_EXISTS=true
    mv .env .env.backup
fi

cp .env.ci .env

# ==========================================================
# Verification
# ==========================================================

echo -e "${BLUE}[1/8] Python version...${NC}"
uv run python --version

echo -e "${BLUE}[2/8] Synchronizing dependencies...${NC}"
uv sync --frozen --extra dev

echo -e "${BLUE}[3/8] Ruff lint...${NC}"
uv run ruff check .

echo -e "${BLUE}[4/8] Ruff formatting...${NC}"
uv run ruff format --check .

echo -e "${BLUE}[5/8] Running backend tests...${NC}"
uv run pytest -v

echo -e "${BLUE}[6/8] Alembic migration validation...${NC}"
uv run alembic check

echo -e "${BLUE}[7/8] Database summary...${NC}"
uv run python scripts/db_summary.py

echo -e "${BLUE}[8/8] Environment restoration...${NC}"
echo "Developer environment will be restored automatically."

echo ""
echo "=========================================================="
echo -e "${GREEN}✓ Backend verification completed successfully.${NC}"
echo "=========================================================="
echo ""