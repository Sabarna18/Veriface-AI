#!/usr/bin/env bash

set -euo pipefail

# ==========================================================
# VeriFace AI — Docker Verification
# ==========================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ROOT_ENV="${ROOT_DIR}/.env"
BACKEND_ENV="${ROOT_DIR}/backend/.env"
BACKEND_ENV_SAMPLE="${ROOT_DIR}/backend/.env.sample"

cd "${ROOT_DIR}"

echo "=========================================="
echo " VeriFace AI — Docker Verification"
echo "=========================================="

# ==========================================================
# Validate required files
# ==========================================================

echo
echo "==> Checking required Docker files"

required_files=(
    "compose.yml"
    "backend/Dockerfile"
    "nginx/Dockerfile"
    "backend/.env.sample"
)

for file in "${required_files[@]}"; do
    if [[ ! -f "${file}" ]]; then
        echo "ERROR: Required file not found: ${file}"
        exit 1
    fi
done

echo "Required Docker files found."

# ==========================================================
# Preserve existing local environment
# ==========================================================
#
# In CI these files normally do not exist.
#
# Locally, however, we must NOT overwrite the developer's
# existing .env files.
# ==========================================================

ROOT_ENV_CREATED=false
BACKEND_ENV_CREATED=false

cleanup() {
    echo
    echo "==> Cleaning temporary CI environment"

    if [[ "${ROOT_ENV_CREATED}" == "true" ]]; then
        rm -f "${ROOT_ENV}"
    fi

    if [[ "${BACKEND_ENV_CREATED}" == "true" ]]; then
        rm -f "${BACKEND_ENV}"
    fi
}

trap cleanup EXIT

# ==========================================================
# Create Compose environment
# ==========================================================

if [[ ! -f "${ROOT_ENV}" ]]; then
    echo
    echo "==> Creating temporary Compose environment"

    cat > "${ROOT_ENV}" <<'EOF'
POSTGRES_USER=veriface
POSTGRES_PASSWORD=veriface_password
POSTGRES_DB=veriface_db
EOF

    ROOT_ENV_CREATED=true
else
    echo
    echo "==> Existing root .env detected — preserving it"
fi

# ==========================================================
# Create backend environment
# ==========================================================

if [[ ! -f "${BACKEND_ENV}" ]]; then
    echo
    echo "==> Creating temporary backend environment"

    cp "${BACKEND_ENV_SAMPLE}" "${BACKEND_ENV}"

    BACKEND_ENV_CREATED=true
else
    echo
    echo "==> Existing backend/.env detected — preserving it"
fi

# ==========================================================
# Validate Docker Compose
# ==========================================================

echo
echo "==> Validating Docker Compose configuration"

docker compose config --quiet

echo "Docker Compose configuration is valid."

# ==========================================================
# Build images
# ==========================================================

echo
echo "==> Building Docker images"

docker compose build

echo
echo "=========================================="
echo " Docker verification passed"
echo "=========================================="