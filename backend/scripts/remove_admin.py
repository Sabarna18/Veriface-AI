"""
One-time script to remove an ADMIN user
Run manually from terminal
"""

from db.database import SessionLocal
from db.models import User, UserRole


def remove_admin():
    db = SessionLocal()

    try:
        print("\n🗑️ Remove Admin User\n")

        user_id = input("Enter Admin ID to remove: ").strip()

        if not user_id:
            print("❌ Admin ID is required")
            return

        # -------------------- FETCH USER --------------------
        user = db.query(User).filter(User.user_id == user_id).first()

        if not user:
            print("❌ User not found")
            return

        if user.role != UserRole.ADMIN:
            print("❌ This user is not an ADMIN")
            return

        # -------------------- CONFIRMATION --------------------
        confirm = (
            input(f"⚠️ Are you sure you want to DELETE admin '{user_id}'? (yes/no): ")
            .strip()
            .lower()
        )

        if confirm != "yes":
            print("❌ Operation cancelled")
            return

        # -------------------- DELETE --------------------
        db.delete(user)
        db.commit()

        print("\n✅ Admin removed successfully")
        print(f"   ID : {user_id}")

    except Exception as e:
        db.rollback()
        print("❌ Failed to remove admin:", e)

    finally:
        db.close()


if __name__ == "__main__":
    remove_admin()
