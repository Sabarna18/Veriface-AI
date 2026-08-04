# backend/scripts/db_summary.py

from collections import Counter

from sqlalchemy import func, text

from db.database import SessionLocal
from db.models import Attendance, User


def print_header(title: str) -> None:
    print()
    print("=" * 70)
    print(title)
    print("=" * 70)


def main() -> None:
    db = SessionLocal()

    try:
        # ======================================================
        # DATABASE
        # ======================================================

        print_header("VeriFace AI Database Summary")

        version = db.execute(text("SELECT version()")).scalar()

        print("Database : PostgreSQL")
        print(f"Version  : {version}")

        # ======================================================
        # USERS
        # ======================================================

        total_users = db.query(User).count()

        active_users = db.query(User).filter(User.is_active.is_(True)).count()

        face_images = db.query(User).filter(User.face_image_key.isnot(None)).count()

        classrooms = db.query(User.classroom_id).distinct().count()

        print_header("Users")

        print(f"Total users          : {total_users}")
        print(f"Active users         : {active_users}")
        print(f"Users with faces     : {face_images}")
        print(f"Classrooms           : {classrooms}")

        # ======================================================
        # CLASSROOM BREAKDOWN
        # ======================================================

        print_header("Classroom Summary")

        classroom_counts = (
            db.query(
                User.classroom_id,
                func.count(User.id),
            )
            .group_by(User.classroom_id)
            .order_by(User.classroom_id)
            .all()
        )

        for classroom, count in classroom_counts:
            print(f"{classroom:<20} {count:>5} users")

        # ======================================================
        # ATTENDANCE
        # ======================================================

        print_header("Attendance")

        attendance_count = db.query(Attendance).count()

        unique_students = db.query(Attendance.user_id).distinct().count()

        print(f"Attendance records   : {attendance_count}")
        print(f"Students attended    : {unique_students}")

        # ======================================================
        # EMBEDDINGS
        # ======================================================

        print_header("Embedding Versions")

        versions = db.query(User.embedding_version).all()

        counts = Counter(v[0] for v in versions if v[0])

        for version, count in counts.items():
            print(f"{version:<20} {count}")

        # ======================================================
        # MODELS
        # ======================================================

        print_header("Embedding Models")

        models = db.query(User.embedding_model).all()

        model_counts = Counter(m[0] for m in models if m[0])

        for model, count in model_counts.items():
            print(f"{model:<20} {count}")

        # ======================================================
        # STORAGE
        # ======================================================

        print_header("Storage")

        migrated = db.query(User).filter(User.face_image_key.isnot(None)).count()

        print("Storage backend      : Supabase Storage")
        print(f"Stored face images   : {migrated}")

        # ======================================================
        # RECENT USERS
        # ======================================================

        print_header("Recent Registrations")

        recent = db.query(User).order_by(User.created_at.desc()).limit(10).all()

        if not recent:
            print("No registered users.")

        for user in recent:
            print(f"{user.user_id:<20}{user.classroom_id:<15}{user.created_at}")

        print()
        print("=" * 70)
        print("Database summary completed successfully.")
        print("=" * 70)

    finally:
        db.close()


if __name__ == "__main__":
    main()
