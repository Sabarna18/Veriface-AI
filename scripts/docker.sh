#!/usr/bin/env bash

# ==========================================================
# VeriFace AI - Docker Stack Verification
# ==========================================================

set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-180}"

CI_ENV_CREATED=false

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

    # Remove only an environment file created by this script.
    if [[ "$CI_ENV_CREATED" == "true" ]]; then
        echo "Removing temporary CI environment file..."
        rm -f backend/.env
    fi

    exit "$exit_code"
}

trap cleanup EXIT


# ----------------------------------------------------------
# 1. Docker Environment
# ----------------------------------------------------------

echo ""
echo "[1/7] Checking Docker environment"

docker --version
docker compose version
docker info > /dev/null

echo "Docker environment OK"


# ----------------------------------------------------------
# 2. CI Environment
# ----------------------------------------------------------

echo ""
echo "[2/7] Preparing Docker environment"

if [[ ! -f backend/.env ]]; then
    echo "backend/.env not found."
    echo "Generating temporary CI environment..."

    cat > backend/.env <<'EOF'
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=veriface

DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/veriface

ENVIRONMENT=test
EOF

    CI_ENV_CREATED=true

    echo "Temporary CI environment created."
else
    echo "Existing backend/.env detected."
    echo "Using existing local environment."
fi

# Compose variable interpolation also needs these variables
# in the shell environment.
set -a
# shellcheck disable=SC1091
source backend/.env
set +a

echo "Docker environment configuration ready"


# ----------------------------------------------------------
# 3. Compose Validation
# ----------------------------------------------------------

echo ""
echo "[3/7] Validating Docker Compose configuration"

docker compose -f "$COMPOSE_FILE" config --quiet

echo "Compose configuration valid"


# ----------------------------------------------------------
# 4. Build Images
# ----------------------------------------------------------

echo ""
echo "[4/7] Building application images"

docker compose -f "$COMPOSE_FILE" build --pull

echo "Docker images built successfully"


# ----------------------------------------------------------
# 5. Start Stack
# ----------------------------------------------------------

echo ""
echo "[5/7] Starting Docker stack"

docker compose -f "$COMPOSE_FILE" up \
    --detach \
    --wait \
    --wait-timeout "$HEALTH_TIMEOUT"

echo "Docker stack started successfully"


# ----------------------------------------------------------
# 6. Container Verification
# ----------------------------------------------------------

echo ""
echo "[6/7] Verifying container state"

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

echo "All containers are running"


# ----------------------------------------------------------
# 7. Final Verification
# ----------------------------------------------------------

echo ""
echo "[7/7] Docker stack verification complete"

echo ""
echo "=========================================="
echo " Docker Verification Passed"
echo "=========================================="