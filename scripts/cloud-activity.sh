#!/usr/bin/env bash

# ==========================================================
# VeriFace AI
# Cloud Activity / Keep-Alive Script
#
# Purpose:
#   Pull the latest released VeriFace AI backend image from
#   GHCR and generate legitimate activity against the
#   cloud services used by VeriFace AI.
#
# Activity:
#
#   Released GHCR Image
#          │
#          ▼
#   Temporary Python Container
#          │
#          ├───────────────┐
#          ▼               ▼
#       Neon DB        Supabase Storage
#          │               │
#       SELECT 1       List objects
#          │               │
#          └───────┬───────┘
#                  ▼
#             Container Exit
#
# IMPORTANT:
#   The normal application entrypoint is bypassed.
#   Alembic migrations are NOT executed.
#
#   Supabase activity is read-only:
#   no files are uploaded, modified, or deleted.
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


# ----------------------------------------------------------
# Supabase
# ----------------------------------------------------------

SUPABASE_URL="${SUPABASE_URL:-}"

SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

SUPABASE_BUCKET="${SUPABASE_BUCKET:-face-images}"


# ==========================================================
# Logging
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


# ==========================================================
# Cleanup
# ==========================================================

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


trap cleanup EXIT


# ==========================================================
# Header
# ==========================================================

log "=============================================="
log " VeriFace AI Cloud Activity"
log "=============================================="


# ==========================================================
# Validate Environment
# ==========================================================

log ""
log "[0/5] Validating environment..."

command -v docker >/dev/null 2>&1 \
    || error "Docker is not installed."

[ -n "${VERSION}" ] \
    || error "VERSION is not configured."

[ -n "${DATABASE_URL}" ] \
    || error "DATABASE_URL is not configured."

[ -n "${RAW_IMAGE_NAME}" ] \
    || error "IMAGE_NAME is not configured."

[ -n "${SUPABASE_URL}" ] \
    || error "SUPABASE_URL is not configured."

[ -n "${SUPABASE_SERVICE_ROLE_KEY}" ] \
    || error "SUPABASE_SERVICE_ROLE_KEY is not configured."

[ -n "${SUPABASE_BUCKET}" ] \
    || error "SUPABASE_BUCKET is not configured."


# ==========================================================
# Normalize GHCR Image
# ==========================================================

# Docker repository names must be lowercase.

IMAGE_NAME="$(
    printf '%s' "${RAW_IMAGE_NAME}" |
    tr '[:upper:]' '[:lower:]'
)"

REGISTRY="$(
    printf '%s' "${REGISTRY}" |
    tr '[:upper:]' '[:lower:]'
)"

IMAGE="${REGISTRY}/${IMAGE_NAME}:${VERSION}"


# ==========================================================
# Normalize Database URL
# ==========================================================

# GitHub Secrets can occasionally contain accidental
# leading/trailing whitespace or newline characters.

DATABASE_URL="$(
    printf '%s' "${DATABASE_URL}" |
    tr -d '\r\n' |
    sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
)"


# Convert SQLAlchemy's psycopg scheme into the standard
# PostgreSQL URI accepted by psycopg.connect().

DATABASE_URL_FOR_PSYCOPG="${DATABASE_URL}"

if [[ "${DATABASE_URL_FOR_PSYCOPG}" == postgresql+psycopg://* ]]; then

    DATABASE_URL_FOR_PSYCOPG="${DATABASE_URL_FOR_PSYCOPG#postgresql+psycopg://}"

    DATABASE_URL_FOR_PSYCOPG="postgresql://${DATABASE_URL_FOR_PSYCOPG}"

fi


# ==========================================================
# Normalize Supabase Configuration
# ==========================================================

SUPABASE_URL="$(
    printf '%s' "${SUPABASE_URL}" |
    tr -d '\r\n' |
    sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
)"

SUPABASE_SERVICE_ROLE_KEY="$(
    printf '%s' "${SUPABASE_SERVICE_ROLE_KEY}" |
    tr -d '\r\n' |
    sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
)"

SUPABASE_BUCKET="$(
    printf '%s' "${SUPABASE_BUCKET}" |
    tr -d '\r\n' |
    sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
)"

# Remove a trailing slash from the project URL.

SUPABASE_URL="${SUPABASE_URL%/}"


# ==========================================================
# Basic Validation
# ==========================================================

case "${DATABASE_URL_FOR_PSYCOPG}" in

    postgresql://*)
        ;;

    *)
        error "DATABASE_URL must use a PostgreSQL connection URL."

        ;;

esac


case "${SUPABASE_URL}" in

    https://*)
        ;;

    http://*)
        ;;

    *)
        error "SUPABASE_URL must be an HTTP/HTTPS URL."

        ;;

esac


# ==========================================================
# Environment Summary
# ==========================================================

log "✓ Environment validated."

log ""
log "Release version : ${VERSION}"
log "GHCR image      : ${IMAGE}"
log "Supabase bucket : ${SUPABASE_BUCKET}"


# ==========================================================
# Pull Released Image
# ==========================================================

log ""
log "[1/5] Pulling released GHCR image..."

docker pull "${IMAGE}"

log "✓ Released image pulled successfully."


# ==========================================================
# Neon Database Activity
# ==========================================================

log ""
log "[2/5] Generating Neon database activity..."

log "Database operation: SELECT 1"


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


log "✓ Neon database activity generated successfully."


# ==========================================================
# Supabase Storage Activity
# ==========================================================

log ""
log "[3/5] Generating Supabase Storage activity..."

log "Storage operation: LIST objects"
log "Bucket: ${SUPABASE_BUCKET}"


docker run \
    --name "${ACTIVITY_CONTAINER}" \
    --rm \
    --entrypoint python \
    -e "SUPABASE_URL=${SUPABASE_URL}" \
    -e "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}" \
    -e "SUPABASE_BUCKET=${SUPABASE_BUCKET}" \
    -e "REQUEST_TIMEOUT=${REQUEST_TIMEOUT}" \
    "${IMAGE}" \
    -c '

import json
import os
import sys
import urllib.error
import urllib.request


supabase_url = os.environ["SUPABASE_URL"]
supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
bucket = os.environ["SUPABASE_BUCKET"]
timeout = int(os.environ.get("REQUEST_TIMEOUT", "15"))


# Supabase Storage object listing endpoint.
#
# The operation is read-only and does not modify bucket contents.

url = (
    f"{supabase_url}"
    f"/storage/v1/object/list/{bucket}"
)


payload = json.dumps({
    "prefix": "",
    "limit": 1,
    "offset": 0,
    "sortBy": {
        "column": "name",
        "order": "asc",
    },
}).encode("utf-8")


request = urllib.request.Request(
    url,
    data=payload,
    method="POST",
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json",

        # API key identifying the controlled server-side
        # caller.
        "apikey": supabase_key,

        # Compatibility with the legacy service-role key
        # and Supabase server-side authentication.
        "Authorization": f"Bearer {supabase_key}",

        "User-Agent": "VeriFace-Cloud-Activity/1.0",
    },
)


try:

    print("Connecting to Supabase Storage...")

    with urllib.request.urlopen(
        request,
        timeout=timeout,
    ) as response:

        status = response.status

        print(f"Supabase HTTP status: {status}")

        if status < 200 or status >= 300:

            print("Supabase Storage returned an unexpected status.")

            sys.exit(1)

        body = response.read().decode("utf-8")

        try:

            objects = json.loads(body)

        except json.JSONDecodeError:

            print("Supabase returned invalid JSON.")

            sys.exit(1)

        if not isinstance(objects, list):

            print("Unexpected Supabase Storage response.")

            sys.exit(1)

        print(
            f"Storage listing successful. "
            f"Objects returned: {len(objects)}"
        )

    print("Supabase Storage activity completed successfully.")


except urllib.error.HTTPError as exc:

    print(
        f"Supabase Storage request failed "
        f"with HTTP {exc.code}."
    )

    try:

        error_body = exc.read().decode("utf-8")

        if error_body:

            print(f"Supabase response: {error_body}")

    except Exception:

        pass

    sys.exit(1)


except urllib.error.URLError as exc:

    print(
        f"Supabase Storage connection failed: {exc.reason}"
    )

    sys.exit(1)


except Exception as exc:

    print(
        f"Supabase Storage activity failed: {exc}"
    )

    sys.exit(1)

'


log "✓ Supabase Storage activity generated successfully."


# ==========================================================
# Optional Production HTTP Activity
# ==========================================================

if [ -n "${HEALTH_URL}" ]; then

    log ""
    log "[4/5] Checking deployed VeriFace API..."

    log "URL: ${HEALTH_URL}"


    docker run \
        --name "${ACTIVITY_CONTAINER}" \
        --rm \
        --entrypoint python \
        -e "HEALTH_URL=${HEALTH_URL}" \
        -e "REQUEST_TIMEOUT=${REQUEST_TIMEOUT}" \
        "${IMAGE}" \
        -c '

import os
import sys
import urllib.error
import urllib.request


url = os.environ["HEALTH_URL"]

timeout = int(
    os.environ.get("REQUEST_TIMEOUT", "15")
)


try:

    request = urllib.request.Request(
        url,
        method="GET",
        headers={
            "User-Agent": "VeriFace-Cloud-Activity/1.0"
        },
    )


    with urllib.request.urlopen(
        request,
        timeout=timeout,
    ) as response:

        status = response.status

        print(f"HTTP status: {status}")


        if status >= 400:

            print(
                "Health endpoint returned an error."
            )

            sys.exit(1)


        print(
            "HTTP activity completed successfully."
        )


except urllib.error.HTTPError as exc:

    print(
        f"Health endpoint returned HTTP {exc.code}."
    )

    sys.exit(1)


except Exception as exc:

    print(
        f"HTTP activity failed: {exc}"
    )

    sys.exit(1)

'


    log "✓ Production API activity completed successfully."

else

    log ""
    log "[4/5] Production HTTP activity skipped."

    log "HEALTH_URL is not configured."

fi


# ==========================================================
# Completion
# ==========================================================

log ""
log "[5/5] Activity verification complete."

log ""

log "=============================================="
log " Cloud Activity Completed Successfully"
log "=============================================="

log ""

log "Release : v${VERSION}"

log "Image   : ${IMAGE}"

log "Neon    : SELECT 1 ✓"

log "Supabase: ${SUPABASE_BUCKET} LIST ✓"

log "HTTP    : ${HEALTH_URL:-disabled}"

log ""

