#!/usr/bin/env python3

"""
One-time migration:
SQLite -> PostgreSQL (Neon)

Usage

uv run python scripts/migrate_sqlite.py
"""

from pathlib import Path
import sqlite3

from sqlalchemy.orm import Session

from db.database import SessionLocal
from db.models import User, Attendance, UserRole


ROOT = Path(__file__).resolve().parents[1]
SQLITE_DB = ROOT / "attendance.db"


# ---------------------------------------------------------
# SQLite
# ---------------------------------------------------------

sqlite = sqlite3.connect(SQLITE_DB)
sqlite.row_factory = sqlite3.Row

sqlite_users = sqlite.execute(
    "SELECT * FROM users ORDER BY id"
).fetchall()

sqlite_attendance = sqlite.execute(
    "SELECT * FROM attendance ORDER BY id"
).fetchall()

print(f"SQLite Users       : {len(sqlite_users)}")
print(f"SQLite Attendance  : {len(sqlite_attendance)}")


# ---------------------------------------------------------
# PostgreSQL
# ---------------------------------------------------------

db: Session = SessionLocal()

try:

    # -----------------------------------------------------
    # Safety Check
    # -----------------------------------------------------

    if db.query(User).count() != 0:

        raise RuntimeError(
            "Target database is not empty."
        )

    # -----------------------------------------------------
    # USERS
    # -----------------------------------------------------

    print("\nMigrating users...")

    for row in sqlite_users:

        db.add(
            User(
                user_id=row["user_id"],
                classroom_id=row["classroom_id"],
                role=UserRole(row["role"]),
                hashed_password=row["hashed_password"],
                face_image_key=row["face_image_key"],
                embedding_version=row["embedding_version"],
                embedding_model=row["embedding_model"],
                embedding_created_at=row["embedding_created_at"],
                is_active=bool(row["is_active"]),
                created_at=row["created_at"],
            )
        )

    db.commit()

    print(
        f"Users migrated : {db.query(User).count()}"
    )

    # -----------------------------------------------------
    # ATTENDANCE
    # -----------------------------------------------------

    print("\nMigrating attendance...")

    for row in sqlite_attendance:

        db.add(
            Attendance(
                user_id=row["user_id"],
                classroom_id=row["classroom_id"],
                date=row["date"],
                time=row["time"],
            )
        )

    db.commit()

    print(
        f"Attendance migrated : {db.query(Attendance).count()}"
    )

    print("\nMigration completed successfully.")

except Exception:

    db.rollback()
    raise

finally:

    sqlite.close()
    db.close()