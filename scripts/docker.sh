#!/usr/bin/env bash

# ==========================================================
# VeriFace AI - Docker Stack Verification
# ==========================================================

set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-180}"

BACKEND_ENV_FILE="backend/.env"
CI_ENV_CREATED=false


# ==========================================================
# Logging Helpers
# ==========================================================

log_section() {
    echo ""
    echo "=================================================="
    echo " $1"
    echo "=================================================="
}


# ==========================================================
# Cleanup & Diagnostics
# ==========================================================

cleanup() {
    exit_code=$?

    trap - EXIT

    log_section "Docker Diagnostics"

    docker compose -f "$COMPOSE_FILE" ps || true

    if [[ "$exit_code" -ne 0 ]]; then

        log_section "Backend Logs"

        docker compose -f "$COMPOSE_FILE" logs \
            --no-color \
            --tail=200 \
            backend || true

        log_section "PostgreSQL Logs"

        docker compose -f "$COMPOSE_FILE" logs \
            --no-color \
            --tail=100 \
            postgres || true

        log_section "Web Logs"

        docker compose -f "$COMPOSE_FILE" logs \
            --no-color \
            --tail=100 \
            web || true
    fi

    log_section "Docker Cleanup"

    docker compose -f "$COMPOSE_FILE" down \
        --volumes \
        --remove-orphans || true

    if [[ "$CI_ENV_CREATED" == "true" ]]; then
        echo "Removing temporary CI environment file..."
        rm -f "$BACKEND_ENV_FILE"
    fi

    if [[ "$exit_code" -eq 0 ]]; then
        echo "Docker cleanup completed."
    else
        echo "Docker verification failed with exit code: $exit_code"
    fi

    exit "$exit_code"
}

trap cleanup EXIT


# ==========================================================
# Start
# ==========================================================

log_section "VeriFace AI - Docker Verification"


# ----------------------------------------------------------
# 1. Repository Validation
# ----------------------------------------------------------

echo ""
echo "[1/8] Validating repository structure..."

if [[ ! -f "$COMPOSE_FILE" ]]; then
    echo "ERROR: Compose file not found: $COMPOSE_FILE"
    exit 1
fi

if [[ ! -d "backend" ]]; then
    echo "ERROR: backend/ directory not found."
    exit 1
fi

echo "✓ Repository structure valid"


# ----------------------------------------------------------
# 2. Docker Environment
# ----------------------------------------------------------

echo ""
echo "[2/8] Checking Docker environment..."

docker --version
docker compose version

if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker daemon is unavailable."
    exit 1
fi

echo "✓ Docker environment available"


# ----------------------------------------------------------
# 3. Prepare Backend Environment
# ----------------------------------------------------------

echo ""
echo "[3/8] Preparing backend environment..."

if [[ ! -f "$BACKEND_ENV_FILE" ]]; then

    echo "backend/.env not found."
    echo "Generating temporary CI environment..."

    cat > "$BACKEND_ENV_FILE" <<'EOF'
# ==========================================================
# VeriFace AI - Docker CI Environment
# Generated automatically by scripts/docker.sh
# DO NOT use these values in production.
# ==========================================================

# ----------------------------------------------------------
# Application
# ----------------------------------------------------------

ENVIRONMENT=test


# ----------------------------------------------------------
# Authentication
# Required by backend Docker entrypoint
# ----------------------------------------------------------

SECRET_KEY=veriface-ci-only-secret-key-not-for-production
ACCESS_TOKEN_EXPIRE_MINUTES=30


# ----------------------------------------------------------
# PostgreSQL
# ----------------------------------------------------------

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=veriface


# ----------------------------------------------------------
# Database
# ----------------------------------------------------------

DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/veriface


# ----------------------------------------------------------
# Legacy Database Migration
# ----------------------------------------------------------

MIGRATE_LEGACY_DB=false
EOF

    CI_ENV_CREATED=true

    echo "✓ Temporary CI environment created"

else

    echo "Existing backend/.env detected."
    echo "Using existing backend environment."

fi


# ----------------------------------------------------------
# Export Compose Variables
# ----------------------------------------------------------

set -a

# shellcheck disable=SC1091
source "$BACKEND_ENV_FILE"

set +a


# ----------------------------------------------------------
# Validate Required Variables
# ----------------------------------------------------------

required_vars=(
    DATABASE_URL
    SECRET_KEY
    ACCESS_TOKEN_EXPIRE_MINUTES
    POSTGRES_USER
    POSTGRES_PASSWORD
    POSTGRES_DB
)

for var in "${required_vars[@]}"; do

    if [[ -z "${!var:-}" ]]; then
        echo "ERROR: Required environment variable is missing: $var"
        exit 1
    fi

done

echo "✓ Backend environment validated"


# ----------------------------------------------------------
# 4. Compose Validation
# ----------------------------------------------------------

echo ""
echo "[4/8] Validating Docker Compose configuration..."

docker compose \
    -f "$COMPOSE_FILE" \
    config \
    --quiet

echo "✓ Docker Compose configuration valid"


# ----------------------------------------------------------
# 5. Build Images
# ----------------------------------------------------------

echo ""
echo "[5/8] Building Docker images..."

docker compose \
    -f "$COMPOSE_FILE" \
    build \
    --pull

echo "✓ Docker images built successfully"


# ----------------------------------------------------------
# 6. Start Stack
# ----------------------------------------------------------

echo ""
echo "[6/8] Starting Docker stack..."

docker compose \
    -f "$COMPOSE_FILE" \
    up \
    --detach \
    --wait \
    --wait-timeout "$HEALTH_TIMEOUT"

echo "✓ Docker stack started successfully"


# ----------------------------------------------------------
# 7. Verify Services
# ----------------------------------------------------------

echo ""
echo "[7/8] Verifying Docker services..."

docker compose -f "$COMPOSE_FILE" ps

exited_services="$(
    docker compose \
        -f "$COMPOSE_FILE" \
        ps \
        --status exited \
        --services
)"

if [[ -n "$exited_services" ]]; then

    echo ""
    echo "ERROR: One or more services exited unexpectedly:"
    echo "$exited_services"

    exit 1
fi


# Check every Compose service exists in the running stack.

expected_services="$(
    docker compose \
        -f "$COMPOSE_FILE" \
        config \
        --services
)"

for service in $expected_services; do

    container_id="$(
        docker compose \
            -f "$COMPOSE_FILE" \
            ps \
            --quiet \
            "$service"
    )"

    if [[ -z "$container_id" ]]; then
        echo "ERROR: Service is not running: $service"
        exit 1
    fi

    echo "✓ $service running"

done


# ----------------------------------------------------------
# 8. Final Verification
# ----------------------------------------------------------

echo ""
echo "[8/8] Docker stack verification complete"

log_section "Docker Verification Passed"

echo "Compose file : $COMPOSE_FILE"
echo "Environment  : ${ENVIRONMENT:-test}"
echo "Services:"
docker compose -f "$COMPOSE_FILE" config --services

echo ""
echo "✓ VeriFace AI Docker stack is healthy"