#!/usr/bin/env bash

set -Eeuo pipefail

# ============================================================
# VeriFace AI - Frontend CI Validation
# ============================================================
#
# Runs the same frontend checks locally and in CI:
#   1. Install dependencies from lockfile
#   2. ESLint
#   3. Production Vite build
#
# Usage:
#   ./scripts/frontend.sh
#
# ============================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"

log() {
    printf '\n==> %s\n' "$1"
}

fail() {
    printf '\nERROR: %s\n' "$1" >&2
    exit 1
}

# ------------------------------------------------------------
# Preconditions
# ------------------------------------------------------------

command -v node >/dev/null 2>&1 \
    || fail "Node.js is not installed or not available in PATH."

command -v npm >/dev/null 2>&1 \
    || fail "npm is not installed or not available in PATH."

[[ -d "${FRONTEND_DIR}" ]] \
    || fail "Frontend directory not found: ${FRONTEND_DIR}"

[[ -f "${FRONTEND_DIR}/package.json" ]] \
    || fail "frontend/package.json not found."

[[ -f "${FRONTEND_DIR}/package-lock.json" ]] \
    || fail "frontend/package-lock.json not found."

# ------------------------------------------------------------
# Environment information
# ------------------------------------------------------------

log "Frontend environment"

echo "Node: $(node --version)"
echo "npm:  $(npm --version)"

cd "${FRONTEND_DIR}"

# ------------------------------------------------------------
# Dependencies
# ------------------------------------------------------------

log "Installing frontend dependencies"

npm ci

# ------------------------------------------------------------
# Lint
# ------------------------------------------------------------

log "Running ESLint"

npm run lint

# ------------------------------------------------------------
# Production build
# ------------------------------------------------------------

log "Building frontend"

npm run build

# ------------------------------------------------------------
# Success
# ------------------------------------------------------------

log "Frontend validation passed"

echo "ESLint: PASS"
echo "Build:  PASS"