#!/usr/bin/env bash

# ==========================================================
# VeriFace AI
# Cloud Activity / Keep-Alive Script
#
# Purpose:
#   Generate minimal legitimate database activity using
#   the released VeriFace AI backend image from GHCR.
#
# The script:
#   1. Pulls a released GHCR backend image
#   2. Runs the image as a temporary database client
#   3. Executes a harmless SELECT 1
#   4. Optionally checks the deployed application
#   5. Removes the temporary container
#
# IMPORTANT:
#   The normal application entrypoint is NOT executed.
#   This prevents accidental production migrations.
# ==========================================================

set -Eeuo pipefail


# ==========================================================
# Configuration
# ==========================================================

REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-${GITHUB_REPOSITORY_OWNER:-}/veriface-ai-backend}"

VERSION="${VERSION:-}"

DATABASE_URL="${DATABASE_URL:-}"

ACTIVITY_CONTAINER="${ACTIVITY_CONTAINER:-veriface-cloud-activity}"

HEALTH_URL="${HEALTH_URL:-}"

REQUEST_TIMEOUT="${REQUEST_TIMEOUT:-15}"


# ==========================================================
# Logging
# ==========================================================

log() {
    echo "[cloud-activity] $*"
}

fail() {
    echo ""
    echo "[cloud-activity] ERROR: $*" >&2
    echo ""
    exit 1
}


# ==========================================================
# Cleanup
# ==========================================================

cleanup() {

    if docker ps -a \
        --format '{{.Names}}' |
        grep -qx "${ACTIVITY_CONTAINER}"; then

        log "Removing temporary container..."

        docker rm -f "${ACTIVITY_CONTAINER}" >/dev/null 2>&1 || true
    fi
}

trap cleanup EXIT


# ==========================================================
# Validation
# ==========================================================

log "=============================================="
log " VeriFace AI Cloud Activity"
log "=============================================="

command -v docker >/dev/null 2>&1 \
    || fail "Docker is not installed."

[ -n "${IMAGE_NAME}" ] \
    || fail "IMAGE_NAME is not configured."

[ -n "${DATABASE_URL}" ] \
    || fail "DATABASE_URL is not configured."

[ -n "${VERSION}" ] \
    || fail "VERSION is not configured."


# ==========================================================
# Image
# ==========================================================

IMAGE="${REGISTRY}/${IMAGE_NAME}:${VERSION}"

log ""
log "Released image:"
log "${IMAGE}"


# ==========================================================
# Pull Released Image
# ==========================================================

log ""
log "[1/3] Pulling released GHCR image..."

docker pull "${IMAGE}"

log "✓ Released image available."


# ==========================================================
# Database Activity
# ==========================================================

log ""
log "[2/3] Generating database activity..."

docker run \
    --name "${ACTIVITY_CONTAINER}" \
    --rm \
    --entrypoint python \
    -e "DATABASE_URL=${DATABASE_URL}" \
    "${IMAGE}" \
    -c '
import os
import sys

try:
    import psycopg

    database_url = os.environ["DATABASE_URL"]

    print("Connecting to database...")

    with psycopg.connect(database_url, connect_timeout=10) as connection:
        with connection.cursor() as cursor:

            cursor.execute("""
                SELECT
                    1 AS activity_check
            """)

            result = cursor.fetchone()

            if result != (1,):
                print("Unexpected database response:", result)
                sys.exit(1)

            print("Database query successful.")

except Exception as exc:
    print("Database activity failed:", exc)
    sys.exit(1)
'

log "✓ Database activity generated."


# ==========================================================
# Optional HTTP Activity
# ==========================================================

if [ -n "${HEALTH_URL}" ]; then

    log ""
    log "[3/3] Checking deployed VeriFace API..."
    log "${HEALTH_URL}"

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
        }
    )

    with urllib.request.urlopen(
        request,
        timeout=${REQUEST_TIMEOUT}
    ) as response:

        status = response.status

        print(f'HTTP status: {status}')

        if status >= 400:
            sys.exit(1)

except Exception as exc:
    print('HTTP activity failed:', exc)
    sys.exit(1)
"

    log "✓ HTTP activity generated."

else

    log ""
    log "[3/3] HTTP activity disabled."
    log "Set HEALTH_URL to enable it."

fi


# ==========================================================
# Completion
# ==========================================================

log ""
log "=============================================="
log " Cloud Activity Completed Successfully"
log "=============================================="
log ""
log "Image : ${IMAGE}"
log "Database : activity generated"
log "HTTP : ${HEALTH_URL:-disabled}"
log ""

