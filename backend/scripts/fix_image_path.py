# backend/scripts/fix_image_paths.py

from pathlib import Path
import os

from db.database import SessionLocal
from db.models import User
from core.config import settings


def fix_paths():
    db = SessionLocal()

    try:
        users = db.query(User).all()

        if not users:
            print("No users found.")
            return

        print(f"Found {len(users)} users\n")

        updated_count = 0

        for user in users:
            old_path = user.face_image_path

            if not old_path:
                continue

            # ✅ FIX 1: normalize path FIRST
            normalized = str(old_path).replace("\\", "/")

            # ✅ FIX 2: extract correct filename
            filename = normalized.split("/")[-1]

            if not filename:
                print(f"[SKIP] Invalid path: {old_path}")
                continue

            # ✅ FIX 3: correct path
            new_path = settings.RAW_FACES_DIR / filename

            print(f"USER: {user.user_id}")
            print(f"OLD : {old_path}")
            print(f"NEW : {new_path}")
            print("-" * 50)

            # ✅ UPDATE DB
            user.face_image_path = str(new_path.resolve())
            updated_count += 1

        db.commit()

        print(f"\n✅ Successfully updated {updated_count} users")

    except Exception as e:
        db.rollback()
        print("❌ Error occurred:", e)

    finally:
        db.close()


if __name__ == "__main__":
    fix_paths()