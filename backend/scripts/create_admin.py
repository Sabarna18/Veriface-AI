"""
One-time script to create an ADMIN user
Run manually from terminal
"""

from getpass import getpass

from db.database import SessionLocal
from db.models import User, UserRole
from core.security import get_password_hash


def create_admin():
    db = SessionLocal()

    try:
        print("\n🔐 Create Admin User\n")

        user_id = input("Admin ID: ").strip()
        classroom_id = input("Classroom ID (or GLOBAL): ").strip()
        password = input("Password (hidden): ")

        if not user_id or not password:
            print("❌ User ID and password are required")
            return

        # Check if admin already exists
        existing = db.query(User).filter(User.user_id == user_id).first()
        if existing:
            print("❌ User already exists")
            return

        admin = User(
            user_id=user_id,
            classroom_id=classroom_id,
            role=UserRole.ADMIN,
            hashed_password=get_password_hash(password),
            face_image_path=None,
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("\n✅ Admin created successfully")
        print(f"   ID        : {user_id}")
        print(f"   Role      : ADMIN")
        print(f"   Classroom : {classroom_id}")

    except Exception as e:
        db.rollback()
        print("❌ Failed to create admin:", e)

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
