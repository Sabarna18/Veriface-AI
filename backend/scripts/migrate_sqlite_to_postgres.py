"""
VeriFace AI
Legacy SQLite -> PostgreSQL Data Migration

This script performs a one-time migration of legacy application
data from the old SQLite database into the PostgreSQL database.

The PostgreSQL database schema must already exist. Alembic should
therefore run before this script.

Usage:

    uv run python scripts/migrate_sqlite_to_postgres.py \
        --sqlite-db /app/legacy/attendance.db

The script is designed to be idempotent:
existing records with matching primary keys are skipped.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

from sqlalchemy import MetaData, Table, create_engine, inspect, select
from sqlalchemy.engine import Connection, Engine

from core.config import settings

# ==========================================================
# Configuration
# ==========================================================

# Tables are migrated in this order when they exist.
#
# Parent tables should appear before child tables so that
# foreign-key relationships remain valid.
MIGRATION_ORDER = (
    "classrooms",
    "users",
    "attendance",
)


# ==========================================================
# CLI
# ==========================================================


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=("Migrate legacy VeriFace AI data from SQLite to PostgreSQL.")
    )

    parser.add_argument(
        "--sqlite-db",
        required=True,
        type=Path,
        help="Path to the legacy SQLite database.",
    )

    return parser.parse_args()


# ==========================================================
# Database Connections
# ==========================================================


def create_sqlite_engine(
    database_path: Path,
) -> Engine:
    if not database_path.exists():
        raise FileNotFoundError(f"Legacy SQLite database not found: {database_path}")

    if not database_path.is_file():
        raise ValueError(f"SQLite database path is not a file: {database_path}")

    database_url = f"sqlite:///{database_path.resolve()}"

    return create_engine(
        database_url,
        future=True,
    )


def create_postgres_engine() -> Engine:
    database_url = settings.DATABASE_URL

    if database_url.startswith("sqlite"):
        raise RuntimeError(
            "DATABASE_URL points to SQLite. "
            "The migration destination must be PostgreSQL."
        )

    return create_engine(
        database_url,
        pool_pre_ping=True,
        future=True,
    )


# ==========================================================
# Schema Utilities
# ==========================================================


def get_common_tables(
    sqlite_engine: Engine,
    postgres_engine: Engine,
) -> list[str]:
    sqlite_inspector = inspect(sqlite_engine)
    postgres_inspector = inspect(postgres_engine)

    sqlite_tables = set(sqlite_inspector.get_table_names())

    postgres_tables = set(postgres_inspector.get_table_names())

    common_tables = sqlite_tables & postgres_tables

    ordered_tables = [
        table_name for table_name in MIGRATION_ORDER if table_name in common_tables
    ]

    # Include additional application tables that exist
    # in both databases but aren't explicitly listed above.
    additional_tables = sorted(
        common_tables - set(ordered_tables) - {"alembic_version"}
    )

    return ordered_tables + additional_tables


# ==========================================================
# Data Transformation
# ==========================================================


def transform_value(
    column_name: str,
    value: Any,
) -> Any:
    """
    Apply migration-specific transformations.

    Legacy face image paths may contain absolute paths from
    the original host machine. Inside Docker, persistent
    application data lives under /app/data.
    """

    if column_name == "face_image_key" and isinstance(value, str) and value:
        marker = "/data/"

        if marker in value:
            relative_path = value.split(
                marker,
                maxsplit=1,
            )[1]

            return str(Path("/app/data") / relative_path)

    return value


def transform_row(
    row: dict[str, Any],
    destination_columns: set[str],
) -> dict[str, Any]:
    """
    Keep only columns that exist in PostgreSQL.

    This allows legacy SQLite tables to contain columns that
    may no longer exist in the current PostgreSQL schema.
    """

    transformed = {}

    for column_name, value in row.items():
        if column_name not in destination_columns:
            continue

        transformed[column_name] = transform_value(
            column_name,
            value,
        )

    return transformed


# ==========================================================
# Migration Logic
# ==========================================================


def record_exists(
    connection: Connection,
    table: Table,
    row: dict[str, Any],
) -> bool:
    primary_key_columns = list(table.primary_key.columns)

    if not primary_key_columns:
        return False

    conditions = []

    for column in primary_key_columns:
        if column.name not in row:
            return False

        conditions.append(column == row[column.name])

    query = select(table).where(*conditions).limit(1)

    return connection.execute(query).first() is not None


def migrate_table(
    table_name: str,
    sqlite_connection: Connection,
    postgres_connection: Connection,
    sqlite_metadata: MetaData,
    postgres_metadata: MetaData,
) -> tuple[int, int]:
    source_table = Table(
        table_name,
        sqlite_metadata,
        autoload_with=sqlite_connection,
    )

    destination_table = Table(
        table_name,
        postgres_metadata,
        autoload_with=postgres_connection,
    )

    destination_columns = {column.name for column in destination_table.columns}

    rows = sqlite_connection.execute(select(source_table)).mappings()

    inserted = 0
    skipped = 0

    for source_row in rows:
        row = transform_row(
            dict(source_row),
            destination_columns,
        )

        if not row:
            skipped += 1
            continue

        if record_exists(
            postgres_connection,
            destination_table,
            row,
        ):
            skipped += 1
            continue

        postgres_connection.execute(destination_table.insert().values(**row))

        inserted += 1

    return inserted, skipped


# ==========================================================
# Migration Runner
# ==========================================================


def run_migration(
    sqlite_path: Path,
) -> None:
    print("")
    print("==============================================")
    print(" VeriFace AI Legacy Database Migration")
    print("==============================================")
    print("")

    print(f"Source      : {sqlite_path}")
    print("Destination : PostgreSQL")
    print("")

    sqlite_engine = create_sqlite_engine(sqlite_path)

    postgres_engine = create_postgres_engine()

    try:
        # Verify both databases are reachable.
        with sqlite_engine.connect():
            print("✓ SQLite database reachable")

        with postgres_engine.connect():
            print("✓ PostgreSQL database reachable")

        tables = get_common_tables(
            sqlite_engine,
            postgres_engine,
        )

        if not tables:
            print("")
            print("No common application tables found to migrate.")
            return

        print("")
        print("Tables selected for migration:")

        for table_name in tables:
            print(f"  - {table_name}")

        print("")

        sqlite_metadata = MetaData()
        postgres_metadata = MetaData()

        total_inserted = 0
        total_skipped = 0

        with sqlite_engine.connect() as source:
            # begin() creates a PostgreSQL transaction.
            #
            # If migration fails, all PostgreSQL changes
            # from this migration run are rolled back.
            with postgres_engine.begin() as destination:
                for table_name in tables:
                    print(f"Migrating table: {table_name}")

                    inserted, skipped = migrate_table(
                        table_name,
                        source,
                        destination,
                        sqlite_metadata,
                        postgres_metadata,
                    )

                    total_inserted += inserted
                    total_skipped += skipped

                    print(f"  Inserted : {inserted}")

                    print(f"  Skipped  : {skipped}")

        print("")
        print("==============================================")
        print(" Migration Completed Successfully")
        print("==============================================")

        print(f"Total inserted : {total_inserted}")

        print(f"Total skipped  : {total_skipped}")

        print("")

    finally:
        sqlite_engine.dispose()
        postgres_engine.dispose()


# ==========================================================
# Entrypoint
# ==========================================================


def main() -> None:
    args = parse_arguments()

    try:
        run_migration(args.sqlite_db)

    except Exception as exc:
        print(
            "",
            file=sys.stderr,
        )

        print(
            "ERROR: Legacy database migration failed.",
            file=sys.stderr,
        )

        print(
            str(exc),
            file=sys.stderr,
        )

        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
