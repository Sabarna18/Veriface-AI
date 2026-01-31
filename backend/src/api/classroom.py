# backend/src/api/classrooms.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
from datetime import date
from pydantic import BaseModel
from core.dependencies import get_current_admin
from db.database import get_db
from db.models import User, Attendance, UserRole

router = APIRouter(prefix="/classrooms", tags=["Classrooms"])


# =====================================================
# ------------------ HELPERS ---------------------------
# =====================================================

def delete_face_image(path: str):
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except Exception as e:
            print(f"[WARN] Failed to delete image {path}: {e}")


def classroom_exists(db: Session, classroom_id: str) -> bool:
    """
    A classroom exists if at least one user is associated with it.
    """
    return (
        db.query(User)
        .filter(User.classroom_id == classroom_id)
        .first()
        is not None
    )


class ClassroomCreateRequest(BaseModel):
    classroom_id: str

# =====================================================
# ------------------ PUBLIC ENDPOINTS -----------------
# =====================================================

@router.get("/")
def list_classrooms(db: Session = Depends(get_db)):
    """
    🌍 PUBLIC
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


@router.get("/{classroom_id}/users")
def list_users_in_classroom(
    classroom_id: str,
    db: Session = Depends(get_db),
):
    """
    🌍 PUBLIC
    List students in a classroom.
    """
    users = (
        db.query(User)
        .filter(
            User.classroom_id == classroom_id,
            User.role == UserRole.USER
        )
        .all()
    )

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
    🌍 PUBLIC
    Fetch today's attendance for a classroom.
    """
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


# =====================================================
# ------------------ ADMIN ENDPOINTS ------------------
# =====================================================

@router.post("/create")
def create_classroom(
    payload: ClassroomCreateRequest,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    classroom_id = payload.classroom_id.strip()

    if classroom_exists(db, classroom_id):
        raise HTTPException(
            status_code=400,
            detail="Classroom already exists"
        )

    # ✅ Create anchor admin user for classroom
    system_user = User(
        user_id=f"classteacher_{classroom_id}",
        classroom_id=classroom_id,
        role=UserRole.ADMIN,
        is_active=True,
        face_image_path=None,  # no face needed
    )

    db.add(system_user)
    db.commit()
    db.refresh(system_user)

    return {
        "message": "Classroom created successfully",
        "classroom_id": classroom_id,
    }

    
@router.delete("/{classroom_id}")
def delete_classroom(
    classroom_id: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """
    🔒 ADMIN ONLY
    Delete a classroom by removing all students
    and attendance records.
    """
    if not classroom_exists(db, classroom_id):
        raise HTTPException(
            status_code=404,
            detail="Classroom not found"
        )

    attendance_records = (
        db.query(Attendance)
        .filter(Attendance.classroom_id == classroom_id)
        .all()
    )

    for record in attendance_records:
        db.delete(record)

    users = (
        db.query(User)
        .filter(
            User.classroom_id == classroom_id,
        )
        .all()
    )

    for user in users:
        delete_face_image(user.face_image_path)
        db.delete(user)

    db.commit()

    return {
        "message": "Classroom deleted successfully",
        "classroom_id": classroom_id,
        "deleted_users": len(users),
        "deleted_attendance_records": len(attendance_records),
    }
