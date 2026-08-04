#!/usr/bin/env python3

"""
==============================================================
VeriFace AI
Legacy Face Image → Supabase Storage Migration
==============================================================

Purpose
-------
Migrates legacy local face image paths stored in PostgreSQL
into Supabase Storage.

Before:

face_image_key =
/home/.../data/raw/registrations/STU001.jpg

After:

face_image_key =
C1/STU001/6d8a2c1a8d1e4....jpg

This script is safe to execute multiple times.
Already migrated users are skipped.
"""

from pathlib import Path

from sqlalchemy.orm import Session

from db.database import SessionLocal
from db.models import User
from utils.storage import storage

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------


def is_legacy_path(value: str | None) -> bool:
    """
    Detect whether the value is still a local filesystem path.
    """

    if not value:
        return False

    return value.startswith("/") or value.startswith("./")


# ------------------------------------------------------------
# Migration
# ------------------------------------------------------------


def migrate() -> None:

    db: Session = SessionLocal()

    migrated = 0
    skipped = 0
    missing = 0
    failed = 0

    print("=" * 60)
    print("VeriFace AI Face Storage Migration")
    print("=" * 60)

    try:
        users = db.query(User).all()

        print(f"Users found : {len(users)}")
        print()

        for user in users:
            print("-" * 60)
            print(f"User : {user.user_id}")

            # -------------------------------------------------
            # Already migrated
            # -------------------------------------------------

            if not is_legacy_path(user.face_image_key):
                print("Status : Already migrated")
                skipped += 1
                continue

            local_path = Path(user.face_image_key)

            print(f"Legacy path : {local_path}")

            # -------------------------------------------------
            # File missing
            # -------------------------------------------------

            if not local_path.exists():
                print("Status : Local image missing")
                missing += 1
                continue

            try:
                print("Uploading to Supabase...")

                storage_key = storage.upload_face(
                    file_path=local_path,
                    classroom_id=user.classroom_id,
                    user_id=user.user_id,
                )

                print(f"Storage key : {storage_key}")

                user.face_image_key = storage_key

                db.commit()

                migrated += 1

                print("Status : Migrated")

            except Exception as exc:
                db.rollback()

                failed += 1

                print("Status : FAILED")
                print(exc)

        print()
        print("=" * 60)
        print("Migration Summary")
        print("=" * 60)
        print(f"Migrated : {migrated}")
        print(f"Skipped  : {skipped}")
        print(f"Missing  : {missing}")
        print(f"Failed   : {failed}")
        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    migrate()
