#!/usr/bin/env bash

set -euo pipefail

# ==========================================================
# Resolve Repository Paths
# ==========================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"

# ==========================================================
# Colors
# ==========================================================

GREEN='\033[0;32m'
BLUE='\033[1;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=========================================================="
echo "         VeriFace AI Backend Verification"
echo "=========================================================="
echo ""

# ==========================================================
# Enter Backend Project
# ==========================================================

cd "${BACKEND_DIR}"

# ==========================================================
# Activate Virtual Environment
# ==========================================================

source .venv/bin/activate

# ==========================================================
# Verification
# ==========================================================

echo -e "${BLUE}[1/8] Python version...${NC}"
python --version

echo -e "${BLUE}[2/8] Verifying dependencies...${NC}"
uv sync --locked

echo -e "${BLUE}[3/8] Ruff lint...${NC}"
ruff check .

echo -e "${BLUE}[4/8] Black formatting...${NC}"
black --check .

echo -e "${BLUE}[5/8] Import sorting...${NC}"
ruff check . --select I

echo -e "${BLUE}[6/8] Running backend tests...${NC}"
pytest -v

echo -e "${BLUE}[7/8] Alembic migration validation...${NC}"
alembic check

echo -e "${BLUE}[8/8] Database summary...${NC}"
python scripts/db_summary.py

echo ""
echo "=========================================================="
echo -e "${GREEN}✓ Backend verification completed successfully.${NC}"
echo "=========================================================="
echo ""