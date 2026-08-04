#!/usr/bin/env bash

# ==========================================================
# VeriFace AI - Docker Stack Verification
# ==========================================================

set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
COMPOSE_CI_FILE="${COMPOSE_CI_FILE:-compose.ci.yml}"

COMPOSE_ARGS=(
    -f "$COMPOSE_FILE"
    -f "$COMPOSE_CI_FILE"
)
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-240}"
POLL_INTERVAL="${POLL_INTERVAL:-5}"

BACKEND_ENV_FILE="backend/.env"
CI_ENV_CREATED=false


# ==========================================================
# Helpers
# ==========================================================

log_section() {
    echo ""
    echo "=================================================="
    echo " $1"
    echo "=================================================="
}


# ==========================================================
# Diagnostics
# ==========================================================

show_health_diagnostics() {

    log_section "Container Status"

    docker compose "${COMPOSE_ARGS[@]}" ps || true

    echo ""

    for service in $(docker compose "${COMPOSE_ARGS[@]}" config --services); do

        container_id="$(
            docker compose \
                "${COMPOSE_ARGS[@]}" \
                ps \
                -q \
                "$service"
        )"

        echo "--- $service ---"

        if [[ -z "$container_id" ]]; then
            echo "Container not found"
            echo ""
            continue
        fi

        docker inspect \
            --format \
            'State={{.State.Status}} Health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} ExitCode={{.State.ExitCode}}' \
            "$container_id" || true

        echo ""
    done
}


# ==========================================================
# Cleanup
# ==========================================================

cleanup() {

    exit_code=$?

    trap - EXIT

    if [[ "$exit_code" -ne 0 ]]; then

        log_section "Docker Verification Failed"

        show_health_diagnostics

        log_section "Backend Logs"

        docker compose \
            "${COMPOSE_ARGS[@]}" \
            logs \
            --no-color \
            --tail=200 \
            backend || true

        log_section "Web Logs"

        docker compose \
            "${COMPOSE_ARGS[@]}" \
            logs \
            --no-color \
            --tail=100 \
            web || true

        log_section "Healthcheck Logs"

        for service in $(docker compose "${COMPOSE_ARGS[@]}" config --services); do

            container_id="$(
                docker compose \
                    "${COMPOSE_ARGS[@]}" \
                    ps \
                    -q \
                    "$service"
            )"

            if [[ -n "$container_id" ]]; then

                echo ""
                echo "--- $service ---"

                docker inspect \
                    --format \
                    '{{if .State.Health}}{{range .State.Health.Log}}{{println .End "exit=" .ExitCode .Output}}{{end}}{{else}}No healthcheck configured{{end}}' \
                    "$container_id" || true

            fi

        done

    fi


    # ------------------------------------------------------
    # Cleanup Docker resources
    # ------------------------------------------------------

    log_section "Docker Cleanup"

    docker compose \
        "${COMPOSE_ARGS[@]}" \
        down \
        --volumes \
        --remove-orphans || true


    # ------------------------------------------------------
    # Remove only CI-created environment
    # ------------------------------------------------------

    if [[ "$CI_ENV_CREATED" == "true" ]]; then

    rm -f "$BACKEND_ENV_FILE"

    if [[ "${ORIGINAL_ENV_EXISTS:-false}" == "true" ]]; then
        mv backend/.env.backup backend/.env
    fi
fi


    if [[ "$exit_code" -eq 0 ]]; then
        echo "✓ Docker cleanup completed"
    else
        echo "✗ Docker verification failed with exit code $exit_code"
    fi

    exit "$exit_code"
}

trap cleanup EXIT


# ==========================================================
# Start
# ==========================================================

log_section "VeriFace AI - Docker Verification"


# ==========================================================
# 1. Repository
# ==========================================================

echo ""
echo "[1/8] Validating repository structure..."

[[ -f "$COMPOSE_FILE" ]] || {
    echo "ERROR: $COMPOSE_FILE not found"
    exit 1
}

[[ -f "$COMPOSE_CI_FILE" ]] || {
    echo "ERROR: $COMPOSE_CI_FILE not found"
    exit 1
}

if [[ ! -d backend ]]; then
    echo "ERROR: backend directory not found"
    exit 1
fi

if [[ ! -d frontend ]]; then
    echo "ERROR: frontend directory not found"
    exit 1
fi

echo "✓ Repository structure valid"


# ==========================================================
# 2. Docker
# ==========================================================

echo ""
echo "[2/8] Checking Docker environment..."

docker --version
docker compose version

if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker daemon unavailable"
    exit 1
fi

echo "✓ Docker environment available"


# ==========================================================
# 3. Environment
# ==========================================================

echo ""
echo "[3/8] Preparing CI environment..."

if [[ ! -f backend/.env.ci ]]; then
    echo "ERROR: backend/.env.ci not found"
    exit 1
fi

if [[ -f backend/.env ]]; then
    mv backend/.env backend/.env.backup
    ORIGINAL_ENV_EXISTS=true
fi

cp backend/.env.ci backend/.env

CI_ENV_CREATED=true

echo "✓ CI environment prepared"

set -a
source backend/.env
set +a


# ----------------------------------------------------------
# Export variables for Compose interpolation
# ----------------------------------------------------------

set -a

# shellcheck disable=SC1091
source "$BACKEND_ENV_FILE"

set +a


required_vars=(
    DATABASE_URL
    SECRET_KEY
    ACCESS_TOKEN_EXPIRE_MINUTES
    SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
)

for var in "${required_vars[@]}"; do

    if [[ -z "${!var:-}" ]]; then
        echo "ERROR: Required variable missing: $var"
        exit 1
    fi

done

echo "✓ Environment validated"


# ==========================================================
# 4. Compose Validation
# ==========================================================

echo ""
echo "[4/8] Validating Compose configuration..."

docker compose \
    "${COMPOSE_ARGS[@]}" \
    config \
    --quiet

echo "✓ Compose configuration valid"


# ==========================================================
# 5. Build
# ==========================================================

echo ""
echo "[5/8] Building Docker images..."

docker compose \
    "${COMPOSE_ARGS[@]}" \
    build \
    --pull

echo "✓ Docker images built"


# ==========================================================
# 6. Start
# ==========================================================

echo ""
echo "[6/8] Starting Docker stack..."

docker compose \
    "${COMPOSE_ARGS[@]}" \
    up \
    --detach

echo "✓ Docker containers created"


# ==========================================================
# 7. Health Verification
# ==========================================================

echo ""
echo "[7/8] Waiting for services to become healthy..."

start_time="$(date +%s)"

expected_services="$(
    docker compose \
    "${COMPOSE_ARGS[@]}" \
    config \
    --services
)"

while true; do

    all_healthy=true

    echo ""
    echo "Service health:"

    for service in $expected_services; do

        container_id="$(
            docker compose \
                "${COMPOSE_ARGS[@]}" \
                ps \
                -q \
                "$service"
        )"

        if [[ -z "$container_id" ]]; then

            echo "  ✗ $service: container missing"
            exit 1

        fi


        state="$(
            docker inspect \
                --format '{{.State.Status}}' \
                "$container_id"
        )"


        health="$(
            docker inspect \
                --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' \
                "$container_id"
        )"


        echo "  $service: state=$state health=$health"


        # --------------------------------------------------
        # Container exited
        # --------------------------------------------------

        if [[ "$state" == "exited" ]] ||
           [[ "$state" == "dead" ]]; then

            echo ""
            echo "ERROR: $service exited unexpectedly"
            exit 1

        fi


        # --------------------------------------------------
        # Explicitly unhealthy
        # --------------------------------------------------

        if [[ "$health" == "unhealthy" ]]; then

            echo ""
            echo "ERROR: $service became unhealthy"

            echo ""
            echo "Healthcheck output:"

            docker inspect \
                --format \
                '{{range .State.Health.Log}}{{println "exit=" .ExitCode .Output}}{{end}}' \
                "$container_id" || true

            exit 1

        fi


        # --------------------------------------------------
        # Still starting
        # --------------------------------------------------

        if [[ "$health" == "starting" ]]; then
            all_healthy=false
        fi


        # --------------------------------------------------
        # No healthcheck
        # --------------------------------------------------

        if [[ "$health" == "none" ]] &&
           [[ "$state" != "running" ]]; then
            all_healthy=false
        fi

    done


    # ------------------------------------------------------
    # All services ready
    # ------------------------------------------------------

    if [[ "$all_healthy" == "true" ]]; then
        break
    fi


    # ------------------------------------------------------
    # Timeout
    # ------------------------------------------------------

    current_time="$(date +%s)"
    elapsed=$((current_time - start_time))

    if (( elapsed >= HEALTH_TIMEOUT )); then

        echo ""
        echo "ERROR: Docker health verification timed out"
        echo "Timeout: ${HEALTH_TIMEOUT}s"

        exit 1
    fi


    echo "Waiting ${POLL_INTERVAL}s..."

    sleep "$POLL_INTERVAL"

done


echo ""
echo "✓ All Docker services healthy"


# ==========================================================
# 8. Final Verification
# ==========================================================

echo ""
echo "[8/8] Final Docker verification..."

docker compose "${COMPOSE_ARGS[@]}" ps

log_section "Docker Verification Passed"

echo "Compose files:"
echo "  • $COMPOSE_FILE"
echo "  • $COMPOSE_CI_FILE"

echo "Environment  : ${ENVIRONMENT:-test}"
echo ""
echo "Services:"

docker compose \
    "${COMPOSE_ARGS[@]}" \
    config \
    --services

echo ""
echo "✓ VeriFace AI Docker stack verified successfully"