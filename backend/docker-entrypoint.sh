#!/usr/bin/env sh

# ==========================================================
# VeriFace AI Backend Entrypoint
# ==========================================================

set -eu

echo ""
echo "=================================================="
echo "          VeriFace AI Backend Starting"
echo "=================================================="
echo ""


# ----------------------------------------------------------
# Validate Environment
# ----------------------------------------------------------

echo "[1/6] Validating environment..."

required_vars="
DATABASE_URL
SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES
"

for var in $required_vars
do
    eval value=\$$var

    if [ -z "$value" ]; then
        echo "ERROR: $var is not set."
        exit 1
    fi
done

echo "✓ Environment validated"


# ----------------------------------------------------------
# Wait for PostgreSQL
# ----------------------------------------------------------

echo ""
echo "[2/6] Waiting for PostgreSQL..."

until uv run python - <<'PY'
from sqlalchemy import create_engine, text
from src.core.config import settings

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
    )

    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    engine.dispose()

    print("Database reachable")

except Exception:
    raise SystemExit(1)
PY
do
    echo "Database unavailable... retrying in 3 seconds"
    sleep 3
done

echo "✓ PostgreSQL is available"


# ----------------------------------------------------------
# Run Alembic
# ----------------------------------------------------------

echo ""
echo "[3/6] Applying database migrations..."

uv run alembic upgrade head

echo "✓ Database schema is up to date"


# ----------------------------------------------------------
# Migrate Legacy SQLite Database
# ----------------------------------------------------------

echo ""
echo "[4/6] Checking legacy database migration..."

if [ "${MIGRATE_LEGACY_DB:-false}" = "true" ]; then

    LEGACY_DB_PATH="${LEGACY_DB_PATH:-/app/legacy/attendance.db}"

    if [ -f "$LEGACY_DB_PATH" ]; then

        echo "Legacy SQLite database found:"
        echo "$LEGACY_DB_PATH"

        echo "Starting legacy database migration..."

        PYTHONPATH=/app/src \
        uv run python \
            /app/scripts/migrate_sqlite_to_postgres.py \
            --sqlite-db "$LEGACY_DB_PATH"
            
        echo "✓ Legacy database migration completed"

    else

        echo "Legacy database not found:"
        echo "$LEGACY_DB_PATH"

        echo "Skipping legacy database migration"

    fi

else

    echo "Legacy database migration disabled"
    echo "Set MIGRATE_LEGACY_DB=true to enable it"

fi


# ----------------------------------------------------------
# Startup Information
# ----------------------------------------------------------

echo ""
echo "[5/6] Launching FastAPI..."

echo "Environment : ${ENVIRONMENT:-production}"
echo "Application : ${APP_NAME:-VeriFace AI}"


# ----------------------------------------------------------
# Start Uvicorn
# ----------------------------------------------------------

echo ""
echo "[6/6] Starting Uvicorn..."

exec uv run uvicorn \
    server:app \
    --app-dir /app/src \
    --host 0.0.0.0 \
    --port 8002 \
    --proxy-headers