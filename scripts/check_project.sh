#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

GREEN='\033[0;32m'
BLUE='\033[1;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=========================================================="
echo "            VeriFace AI Project Verification"
echo "=========================================================="
echo ""

############################################################
# Backend
############################################################

echo -e "${BLUE}Running backend verification...${NC}"
"${ROOT_DIR}/scripts/check_backend.sh"

############################################################
# Frontend
############################################################

echo -e "${BLUE}Running frontend verification...${NC}"

cd "${FRONTEND_DIR}"

echo -e "${BLUE}[1/4] Installing dependencies...${NC}"
npm ci

echo -e "${BLUE}[2/4] ESLint...${NC}"
npm run lint

echo -e "${BLUE}[4/4] Production build...${NC}"
npm run build

############################################################
# Complete
############################################################

echo ""
echo "=========================================================="
echo -e "${GREEN}✓ VeriFace AI verification completed successfully.${NC}"
echo -e "${GREEN}✓ Backend checks passed.${NC}"
echo -e "${GREEN}✓ Frontend checks passed.${NC}"
echo -e "${GREEN}✓ Project is ready for commit and push.${NC}"
echo "=========================================================="
echo ""