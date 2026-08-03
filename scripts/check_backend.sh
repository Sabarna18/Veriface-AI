#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[1;34m'
NC='\033[0m'

echo ""
echo "=========================================================="
echo "         VeriFace AI Backend Verification"
echo "=========================================================="
echo ""

cd "${BACKEND_DIR}"

echo -e "${BLUE}[1/8] Python version...${NC}"
uv run python --version

echo -e "${BLUE}[2/8] Synchronizing dependencies...${NC}"
uv sync --locked

echo -e "${BLUE}[3/8] Ruff lint...${NC}"
uv run ruff check .

echo -e "${BLUE}[4/8] Black formatting...${NC}"
uv run black --check .

echo -e "${BLUE}[5/8] Import sorting...${NC}"
uv run ruff check . --select I

echo -e "${BLUE}[6/8] Running backend tests...${NC}"
uv run pytest -v

echo -e "${BLUE}[7/8] Alembic migration validation...${NC}"
uv run alembic check

echo -e "${BLUE}[8/8] Database summary...${NC}"
uv run python scripts/db_summary.py

echo ""
echo -e "${GREEN}✓ Backend verification completed successfully.${NC}"
echo ""