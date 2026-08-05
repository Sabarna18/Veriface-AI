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

# ==========================================================
# Defaults
# ==========================================================

WAIT_FOR_DATABASE="${WAIT_FOR_DATABASE:-true}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
RUN_LEGACY_MIGRATION="${RUN_LEGACY_MIGRATION:-false}"

# ==========================================================
# Validate Environment
# ==========================================================

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

# ==========================================================
# Wait for Database
# ==========================================================

echo ""
echo "[2/6] Database readiness..."

if [ "$WAIT_FOR_DATABASE" = "true" ]; then

    echo "Waiting for database..."

    until uv run python - <<'PY'
from sqlalchemy import create_engine, text
from src.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)

with engine.connect() as conn:
    conn.execute(text("SELECT 1"))

engine.dispose()
PY
    do
        echo "Database unavailable... retrying in 3 seconds"
        sleep 3
    done

    echo "✓ Database reachable"

else

    echo "Skipping database wait"

fi

# ==========================================================
# Alembic
# ==========================================================

echo ""
echo "[3/6] Database migrations..."

if [ "$RUN_MIGRATIONS" = "true" ]; then

    uv run alembic upgrade head

    echo "✓ Database schema is up to date"

else

    echo "Skipping Alembic migrations"

fi

# ==========================================================
# Legacy Migration
# ==========================================================

echo ""
echo "[4/6] Legacy migration..."

if [ "$RUN_LEGACY_MIGRATION" = "true" ]; then

    LEGACY_DB_PATH="${LEGACY_DB_PATH:-/app/legacy/attendance.db}"

    if [ -f "$LEGACY_DB_PATH" ]; then

        echo "Migrating legacy SQLite database..."

        PYTHONPATH=/app/src \
        uv run python \
            /app/scripts/migrate_sqlite_to_postgres.py \
            --sqlite-db "$LEGACY_DB_PATH"

        echo "✓ Legacy migration completed"

    else

        echo "Legacy database not found."
        echo "Skipping migration."

    fi

else

    echo "Legacy migration disabled"

fi

# ==========================================================
# Startup
# ==========================================================

echo ""
echo "[5/6] Launching FastAPI..."

echo "Application : ${APP_NAME:-VeriFace AI}"
echo "Environment : ${ENVIRONMENT:-production}"
echo "Database Wait : ${WAIT_FOR_DATABASE}"
echo "Alembic : ${RUN_MIGRATIONS}"
echo "Legacy Migration : ${RUN_LEGACY_MIGRATION}"

echo ""
echo "[6/6] Starting Uvicorn..."

exec uv run uvicorn \
    server:app \
    --app-dir /app/src \
    --host 0.0.0.0 \
    --port "${PORT:-8002}"\
    --proxy-headers