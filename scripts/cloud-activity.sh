#!/usr/bin/env bash

# ==========================================================
# VeriFace AI
# Cloud Activity / Keep-Alive Script
#
# Purpose:
#   Pull the latest released VeriFace AI backend image from
#   GHCR and generate minimal legitimate database activity.
#
# Flow:
#
#   Released GHCR Image
#          ↓
#   Temporary Python Container
#          ↓
#   PostgreSQL Connection
#          ↓
#       SELECT 1
#          ↓
#       Container Exit
#          ↓
#        Cleanup
#
# IMPORTANT:
#   The normal application entrypoint is deliberately bypassed.
#   This prevents accidental Alembic migrations or application
#   startup against the production database.
# ==========================================================

set -Eeuo pipefail


# ==========================================================
# Configuration
# ==========================================================

REGISTRY="${REGISTRY:-ghcr.io}"

RAW_IMAGE_NAME="${IMAGE_NAME:-${GITHUB_REPOSITORY_OWNER:-}/veriface-ai-backend}"

VERSION="${VERSION:-}"

DATABASE_URL="${DATABASE_URL:-}"

HEALTH_URL="${HEALTH_URL:-}"

REQUEST_TIMEOUT="${REQUEST_TIMEOUT:-15}"

ACTIVITY_CONTAINER="${ACTIVITY_CONTAINER:-veriface-cloud-activity}"


# ==========================================================
# Helpers
# ==========================================================

log() {
    echo "[cloud-activity] $*"
}


error() {
    echo ""
    echo "[cloud-activity] ERROR: $*" >&2
    echo ""
    exit 1
}


cleanup() {

    log ""
    log "Cleaning up temporary resources..."

    if docker ps -a \
        --format '{{.Names}}' |
        grep -Fxq "${ACTIVITY_CONTAINER}"; then

        docker rm -f "${ACTIVITY_CONTAINER}" \
            >/dev/null 2>&1 || true

        log "✓ Temporary container removed."

    else

        log "✓ No temporary container found."

    fi
}


# Always clean up before exiting.
trap cleanup EXIT


# ==========================================================
# Header
# ==========================================================

log "=============================================="
log " VeriFace AI Cloud Activity"
log "=============================================="


# ==========================================================
# Validate Dependencies
# ==========================================================

log ""
log "[0/4] Validating environment..."


command -v docker >/dev/null 2>&1 \
    || error "Docker is not installed."


[ -n "${VERSION}" ] \
    || error "VERSION is not configured."


[ -n "${DATABASE_URL}" ] \
    || error "DATABASE_URL is not configured."


[ -n "${RAW_IMAGE_NAME}" ] \
    || error "IMAGE_NAME is not configured."


# ==========================================================
# Normalize GHCR Image Name
# ==========================================================

# Docker requires repository names to be lowercase.
#
# Example:
#
#   Sabarna18/veriface-ai-backend
#
# becomes:
#
#   sabarna18/veriface-ai-backend
#
# GitHub repository owners can contain uppercase characters,
# while Docker image repository references must be lowercase.

IMAGE_NAME="$(printf '%s' "${RAW_IMAGE_NAME}" | tr '[:upper:]' '[:lower:]')"

REGISTRY="$(printf '%s' "${REGISTRY}" | tr '[:upper:]' '[:lower:]')"

IMAGE="${REGISTRY}/${IMAGE_NAME}:${VERSION}"


log "✓ Environment validated."

log ""
log "Release version : ${VERSION}"
log "GHCR image      : ${IMAGE}"


# ==========================================================
# Validate Image Reference
# ==========================================================

case "${IMAGE}" in

    *[A-Z]*)
        error "Image reference still contains uppercase characters: ${IMAGE}"
        ;;

esac


# ==========================================================
# Pull Released Image
# ==========================================================

log ""
log "[1/4] Pulling released GHCR image..."

docker pull "${IMAGE}"

log "✓ Released image pulled successfully."


# ==========================================================
# Generate Database Activity
# ==========================================================

log ""
log "[2/4] Generating database activity..."

log "Database operation: SELECT 1"


# ----------------------------------------------------------
# Normalize SQLAlchemy-style DATABASE_URL
#
# Application configuration commonly uses:
#
#   postgresql+psycopg://
#
# psycopg.connect() expects:
#
#   postgresql://
# ----------------------------------------------------------

DATABASE_URL_FOR_PSYCOPG="${DATABASE_URL}"

if [[ "${DATABASE_URL_FOR_PSYCOPG}" == postgresql+psycopg://* ]]; then

    DATABASE_URL_FOR_PSYCOPG="${DATABASE_URL_FOR_PSYCOPG/postgresql+psycopg:\/\//postgresql:\/\/}"

fi


# ----------------------------------------------------------
# Run Python from the released image
#
# --entrypoint python bypasses the application's normal
# docker-entrypoint.sh.
#
# Therefore:
#
#   NO Alembic migration
#   NO Uvicorn startup
#   NO application writes
#
# Only:
#
#   connect → SELECT 1 → exit
# ----------------------------------------------------------

docker run \
    --name "${ACTIVITY_CONTAINER}" \
    --rm \
    --entrypoint python \
    -e "DATABASE_URL=${DATABASE_URL_FOR_PSYCOPG}" \
    "${IMAGE}" \
    -c '
import os
import sys

try:

    import psycopg

    database_url = os.environ["DATABASE_URL"]

    print("Connecting to PostgreSQL...")

    with psycopg.connect(
        database_url,
        connect_timeout=10,
    ) as connection:

        print("Connection established.")

        with connection.cursor() as cursor:

            cursor.execute("SELECT 1;")

            result = cursor.fetchone()

            print(f"Database response: {result}")

            if result != (1,):
                print("Unexpected database response.")
                sys.exit(1)

    print("Database activity completed successfully.")

except Exception as exc:

    print(f"Database activity failed: {exc}")

    sys.exit(1)
'


log "✓ Database activity generated successfully."


# ==========================================================
# Optional Production HTTP Activity
# ==========================================================

if [ -n "${HEALTH_URL}" ]; then

    log ""
    log "[3/4] Checking deployed VeriFace API..."

    log "URL: ${HEALTH_URL}"


    docker run \
        --name "${ACTIVITY_CONTAINER}" \
        --rm \
        --entrypoint python \
        "${IMAGE}" \
        -c "
import sys
import urllib.request

url = '${HEALTH_URL}'

try:

    request = urllib.request.Request(
        url,
        method='GET',
        headers={
            'User-Agent': 'VeriFace-Cloud-Activity/1.0'
        },
    )

    with urllib.request.urlopen(
        request,
        timeout=${REQUEST_TIMEOUT},
    ) as response:

        status = response.status

        print(f'HTTP status: {status}')

        if status >= 400:
            print('Health endpoint returned an error.')
            sys.exit(1)

        print('HTTP activity completed successfully.')

except Exception as exc:

    print(f'HTTP activity failed: {exc}')

    sys.exit(1)
"


    log "✓ Production API activity completed successfully."

else

    log ""
    log "[3/4] Production HTTP activity skipped."

    log "HEALTH_URL is not configured."

fi


# ==========================================================
# Final Verification
# ==========================================================

log ""
log "[4/4] Activity verification complete."

log ""
log "=============================================="
log " Cloud Activity Completed Successfully"
log "=============================================="
log ""
log "Release : v${VERSION}"
log "Image   : ${IMAGE}"
log "Database: SELECT 1"
log "HTTP    : ${HEALTH_URL:-disabled}"
log ""

