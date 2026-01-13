from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
from db.database import get_db
from db.models import User, Attendance

router = APIRouter(prefix="/classrooms", tags=["Classrooms"])


# =====================================================
# ------------------ HELPERS ---------------------------
# =====================================================

def get_user_in_classroom(
    db: Session,
    user_id: str,
    classroom_id: str,
) -> User:
    """
    Fetch a user scoped to a classroom.
    Raises 404 if not found.
    """
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.classroom_id == classroom_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in this classroom"
        )

    return user

def delete_face_image(path: str):
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except Exception:
            pass


def get_users_in_classroom(
    db: Session,
    classroom_id: str,
) -> List[User]:
    """
    Fetch all users in a classroom.
    """
    return (
        db.query(User)
        .filter(User.classroom_id == classroom_id)
        .all()
    )


def classroom_exists(
    db: Session,
    classroom_id: str,
) -> bool:
    """
    Classroom existence is inferred from users.
    """
    return (
        db.query(User)
        .filter(User.classroom_id == classroom_id)
        .first()
        is not None
    )


# =====================================================
# ------------------ ENDPOINTS -------------------------
# =====================================================

@router.get("/")
def list_classrooms(db: Session = Depends(get_db)):
    """
    List all classrooms (derived from users table).
    """
    classrooms = (
        db.query(User.classroom_id)
        .distinct()
        .all()
    )

    classroom_ids = [c[0] for c in classrooms]

    return {
        "count": len(classroom_ids),
        "classrooms": classroom_ids,
    }


@router.post("/create")
def create_classroom(
    classroom_id: str,
    db: Session = Depends(get_db),
):
    """
    Create a classroom by inserting a system user.
    """

    # 1️⃣ Check if classroom already exists
    exists = (
        db.query(User)
        .filter(User.classroom_id == classroom_id)
        .first()
    )
    if exists:
        raise HTTPException(
            status_code=400,
            detail="Classroom already exists"
        )

    # 2️⃣ Create system user for classroom
    system_user_id = f"CLASSTEACHER_{classroom_id}"

    system_user = User(
        user_id=system_user_id,
        classroom_id=classroom_id,
        face_image_path=None,
    )

    db.add(system_user)
    db.commit()
    db.refresh(system_user)

    return {
        "message": "Classroom created successfully",
        "classroom_id": classroom_id,
    }


@router.get("/{classroom_id}/users")
def list_users_in_classroom(
    classroom_id: str,
    db: Session = Depends(get_db),
):
    """
    List users in a classroom.
    """
    users = get_users_in_classroom(db, classroom_id)

    return {
        "classroom_id": classroom_id,
        "count": len(users),
        "users": [
            {
                "user_id": user.user_id,
                "created_at": (
                    user.created_at.isoformat()
                    if user.created_at else None
                ),
            }
            for user in users
        ],
    }


@router.get("/{classroom_id}/attendance/today")
def get_today_attendance_for_classroom(
    classroom_id: str,
    db: Session = Depends(get_db),
):
    """
    Fetch today's attendance for a classroom.
    """
    from datetime import date

    today = date.today()

    records = (
        db.query(Attendance)
        .filter(
            Attendance.classroom_id == classroom_id,
            Attendance.date == today
        )
        .all()
    )

    return {
        "classroom_id": classroom_id,
        "date": today,
        "count": len(records),
        "records": [
            {
                "user_id": r.user_id,
                "time": r.time.strftime("%H:%M:%S"),
            }
            for r in records
        ],
    }

@router.delete("/{classroom_id}")
def delete_classroom(
    classroom_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a classroom by removing all related users
    and attendance records.
    """

    # 1️⃣ Check if classroom exists
    exists = (
        db.query(User)
        .filter(User.classroom_id == classroom_id)
        .first()
    )

    if not exists:
        raise HTTPException(
            status_code=404,
            detail="Classroom not found"
        )

    # 2️⃣ Delete attendance records
    attendance_records = (
        db.query(Attendance)
        .filter(Attendance.classroom_id == classroom_id)
        .all()
    )

    for record in attendance_records:
        db.delete(record)

    # 3️⃣ Delete users (including system user)
    users = (
        db.query(User)
        .filter(User.classroom_id == classroom_id)
        .all()
    )

    for user in users:
        db.delete(user)
        delete_face_image(user.face_image_path)

    db.commit()

    return {
        "message": "Classroom deleted successfully",
        "classroom_id": classroom_id,
        "deleted_users": len(users),
        "deleted_attendance_records": len(attendance_records),
    }

