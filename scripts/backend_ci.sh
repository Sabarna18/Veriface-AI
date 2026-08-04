#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"

GREEN='\033[0;32m'
BLUE='\033[1;34m'
NC='\033[0m'

echo ""
echo "=========================================================="
echo "         VeriFace AI Backend CI Verification"
echo "=========================================================="
echo ""

cd "${BACKEND_DIR}"

echo -e "${BLUE}[1/6] Python version...${NC}"
uv run python --version

echo -e "${BLUE}[2/6] Synchronizing dependencies...${NC}"
uv sync --frozen --extra dev

echo -e "${BLUE}[3/6] Ruff lint...${NC}"
uv run ruff check .

echo -e "${BLUE}[4/6] Ruff formatting...${NC}"
uv run ruff format --check .

echo -e "${BLUE}[5/6] Running backend tests...${NC}"

cp .env.ci .env

uv run pytest -v

rm -f .env

echo -e "${BLUE}[6/6] Backend verification complete.${NC}"

echo ""
echo "=========================================================="
echo -e "${GREEN}✓ Backend CI verification completed successfully.${NC}"
echo "=========================================================="
echo ""