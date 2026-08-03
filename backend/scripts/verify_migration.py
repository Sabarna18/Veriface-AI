#!/usr/bin/env python3
"""Verify SQLite -> PostgreSQL migration for VeriFace AI."""

from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

from sqlalchemy import text

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from db.database import SessionLocal  # noqa: E402

LEGACY_DB = ROOT / "attendance.db"


def sqlite_count(conn, table: str) -> int:
    return conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]


def postgres_count(session, table: str) -> int:
    return session.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()


def compare_users(sqlite_conn, session):
    print("\nUsers")
    sqlite_rows = sqlite_count(sqlite_conn, "users")
    postgres_rows = postgres_count(session, "users")
    print(f"SQLite     : {sqlite_rows}")
    print(f"PostgreSQL : {postgres_rows}")
    if sqlite_rows != postgres_rows:
        raise RuntimeError("User row counts do not match.")


def compare_attendance(sqlite_conn, session):
    print("\nAttendance")
    sqlite_rows = sqlite_count(sqlite_conn, "attendance")
    postgres_rows = postgres_count(session, "attendance")
    print(f"SQLite     : {sqlite_rows}")
    print(f"PostgreSQL : {postgres_rows}")
    if sqlite_rows != postgres_rows:
        raise RuntimeError("Attendance row counts do not match.")


def compare_user_ids(sqlite_conn, session):
    sqlite_ids = {
        r[0]
        for r in sqlite_conn.execute(
            "SELECT user_id FROM users ORDER BY user_id"
        ).fetchall()
    }
    postgres_ids = {
        r[0]
        for r in session.execute(
            text("SELECT user_id FROM users ORDER BY user_id")
        ).fetchall()
    }
    if sqlite_ids != postgres_ids:
        missing = sqlite_ids - postgres_ids
        extra = postgres_ids - sqlite_ids
        raise RuntimeError(
            f"User ID mismatch. Missing={len(missing)} Extra={len(extra)}"
        )
    print("\n✓ User identifiers match.")


def main():
    print("=" * 60)
    print("VeriFace AI Migration Verification")
    print("=" * 60)

    if not LEGACY_DB.exists():
        raise FileNotFoundError(LEGACY_DB)

    sqlite_conn = sqlite3.connect(LEGACY_DB)
    session = SessionLocal()

    try:
        compare_users(sqlite_conn, session)
        compare_attendance(sqlite_conn, session)
        compare_user_ids(sqlite_conn, session)

        print("\n" + "=" * 60)
        print("Verification PASSED")
        print("=" * 60)

    finally:
        sqlite_conn.close()
        session.close()


if __name__ == "__main__":
    main()
