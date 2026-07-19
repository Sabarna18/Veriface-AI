from __future__ import annotations

from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

import sys

# ==========================================================
# Make project importable
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# ==========================================================
# Application imports
# ==========================================================

from src.core.config import settings
from src.db.database import Base

# Import all ORM models so they are registered with Base.metadata
from src.db import models  # noqa: F401

# ==========================================================
# Alembic Configuration
# ==========================================================

config = context.config

config.set_main_option(
    "sqlalchemy.url",
    settings.DATABASE_URL,
)

# ==========================================================
# Logging
# ==========================================================

if config.config_file_name:
    fileConfig(config.config_file_name)

# ==========================================================
# Metadata
# ==========================================================

target_metadata = Base.metadata

# ==========================================================
# Offline migrations
# ==========================================================


def run_migrations_offline() -> None:
    """Run migrations without a database connection."""

    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ==========================================================
# Online migrations
# ==========================================================


def run_migrations_online() -> None:
    """Run migrations using a live database connection."""

    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ==========================================================
# Entrypoint
# ==========================================================

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()