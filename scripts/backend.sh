#!/usr/bin/env bash

set -Eeuo pipefail

# ============================================================
# VeriFace AI - Backend CI Validation
# ============================================================
#
# Runs the same backend checks locally and in CI:
#
#   1. Verify uv
#   2. Prepare CI environment
#   3. Synchronize dependencies
#   4. Ruff lint
#   5. Ruff formatting
#   6. Pytest
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

cleanup() {
    rm -f "${BACKEND_DIR}/.env"
}

trap cleanup EXIT

# ------------------------------------------------------------
# Preconditions
# ------------------------------------------------------------

command -v uv >/dev/null 2>&1 \
    || fail "uv is not installed or not available in PATH."

[[ -d "${BACKEND_DIR}" ]] \
    || fail "Backend directory not found."

[[ -f "${BACKEND_DIR}/pyproject.toml" ]] \
    || fail "backend/pyproject.toml not found."

[[ -f "${BACKEND_DIR}/uv.lock" ]] \
    || fail "backend/uv.lock not found."

[[ -f "${BACKEND_DIR}/.env.ci" ]] \
    || fail "backend/.env.ci not found."

# ------------------------------------------------------------
# Environment
# ------------------------------------------------------------

log "Backend environment"

echo "uv: $(uv --version)"

cd "${BACKEND_DIR}"

# ------------------------------------------------------------
# Prepare CI Environment
# ------------------------------------------------------------

log "Preparing CI environment"

cp .env.ci .env

# ------------------------------------------------------------
# Dependencies
# ------------------------------------------------------------

log "Synchronizing backend dependencies"

uv sync --frozen --extra dev

# ------------------------------------------------------------
# Ruff Lint
# ------------------------------------------------------------

log "Running Ruff lint"

uv run ruff check .

# ------------------------------------------------------------
# Ruff Formatting
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