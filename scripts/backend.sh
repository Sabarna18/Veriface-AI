#!/usr/bin/env bash

set -Eeuo pipefail

# ============================================================
# VeriFace AI - Backend CI Validation
# ============================================================
#
# Runs the same backend checks locally and in CI:
#   1. Verify uv
#   2. Synchronize dependencies from lockfile
#   3. Ruff lint
#   4. Ruff formatting check
#   5. Pytest
#
# Usage:
#   ./scripts/backend.sh
#
# ============================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"

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

command -v uv >/dev/null 2>&1 \
    || fail "uv is not installed or not available in PATH."

[[ -d "${BACKEND_DIR}" ]] \
    || fail "Backend directory not found: ${BACKEND_DIR}"

[[ -f "${BACKEND_DIR}/pyproject.toml" ]] \
    || fail "backend/pyproject.toml not found."

[[ -f "${BACKEND_DIR}/uv.lock" ]] \
    || fail "backend/uv.lock not found."

# ------------------------------------------------------------
# Environment information
# ------------------------------------------------------------

log "Backend environment"

echo "uv: $(uv --version)"

cd "${BACKEND_DIR}"

# ------------------------------------------------------------
# Dependencies
# ------------------------------------------------------------

log "Synchronizing backend dependencies"

uv sync --frozen --extra dev

# ------------------------------------------------------------
# Ruff lint
# ------------------------------------------------------------

log "Running Ruff lint"

uv run ruff check .

# ------------------------------------------------------------
# Ruff formatting
# ------------------------------------------------------------

log "Checking Ruff formatting"

uv run ruff format --check .

# ------------------------------------------------------------
# Tests
# ------------------------------------------------------------

log "Running backend tests"

uv run pytest

# ------------------------------------------------------------
# Success
# ------------------------------------------------------------

log "Backend validation passed"

echo "Ruff lint:   PASS"
echo "Ruff format: PASS"
echo "Pytest:      PASS"