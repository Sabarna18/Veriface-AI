#!/usr/bin/env bash

# ==========================================================
# VeriFace AI - Docker Stack Verification
# ==========================================================

set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yaml}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-120}"
POLL_INTERVAL="${POLL_INTERVAL:-5}"

echo "=========================================="
echo " VeriFace AI - Docker Verification"
echo "=========================================="

# ----------------------------------------------------------
# Cleanup
# ----------------------------------------------------------

cleanup() {
    exit_code=$?

    echo ""
    echo "=========================================="
    echo " Docker Diagnostics"
    echo "=========================================="

    docker compose -f "$COMPOSE_FILE" ps || true

    if [[ "$exit_code" -ne 0 ]]; then
        echo ""
        echo "Container logs:"
        docker compose -f "$COMPOSE_FILE" logs --no-color || true
    fi

    echo ""
    echo "Stopping verification stack..."

    docker compose -f "$COMPOSE_FILE" down \
        --volumes \
        --remove-orphans || true

    exit "$exit_code"
}

trap cleanup EXIT


# ----------------------------------------------------------
# 1. Environment
# ----------------------------------------------------------

echo ""
echo "[1/6] Checking Docker environment"

docker --version
docker compose version

docker info > /dev/null

echo "Docker environment OK"


# ----------------------------------------------------------
# 2. Compose Validation
# ----------------------------------------------------------

echo ""
echo "[2/6] Validating Docker Compose configuration"

docker compose -f "$COMPOSE_FILE" config --quiet

echo "Compose configuration valid"


# ----------------------------------------------------------
# 3. Build Images
# ----------------------------------------------------------

echo ""
echo "[3/6] Building application images"

docker compose -f "$COMPOSE_FILE" build \
    --pull

echo "Docker images built successfully"


# ----------------------------------------------------------
# 4. Start Stack
# ----------------------------------------------------------

echo ""
echo "[4/6] Starting Docker stack"

docker compose -f "$COMPOSE_FILE" up \
    --detach \
    --wait \
    --wait-timeout "$HEALTH_TIMEOUT"

echo "Docker stack started"


# ----------------------------------------------------------
# 5. Verify Containers
# ----------------------------------------------------------

echo ""
echo "[5/6] Verifying container state"

docker compose -f "$COMPOSE_FILE" ps

failed_services="$(
    docker compose -f "$COMPOSE_FILE" ps \
        --status exited \
        --services
)"

if [[ -n "$failed_services" ]]; then
    echo "One or more services exited unexpectedly:"
    echo "$failed_services"
    exit 1
fi

echo "Containers are running"


# ----------------------------------------------------------
# 6. Final Verification
# ----------------------------------------------------------

echo ""
echo "[6/6] Docker stack verification complete"

echo ""
echo "=========================================="
echo " Docker Verification Passed"
echo "=========================================="