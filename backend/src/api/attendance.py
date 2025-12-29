from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime

from db.database import get_db
from db.models import Attendance, User

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ------------------ MARK ATTENDANCE ------------------

@router.post("/mark/{user_id}")
def mark_attendance(
    user_id: str,
    db: Session = Depends(get_db),
):
    # 1️⃣ Ensure user exists
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    today = date.today()

    # 2️⃣ Prevent duplicate attendance
    exists = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == user_id,
            Attendance.date == today
        )
        .first()
    )
    if exists:
        return {"message": "Attendance already marked"}

    # 3️⃣ Create attendance record
    attendance = Attendance(
        user_id=user.user_id,
        date=today,
        time=datetime.now().time(),
    )

    db.add(attendance)
    db.commit()

    return {
        "message": "Attendance marked successfully",
        "user_id": user.user_id,
        "date": today,
    }


# ------------------ GET TODAY ATTENDANCE (ALL) ------------------

@router.get("/today")
def get_today_attendance(db: Session = Depends(get_db)):
    today = date.today()

    records = (
        db.query(Attendance, User)
        .join(User, Attendance.user_id == User.user_id)
        .filter(Attendance.date == today)
        .all()
    )

    return {
        "date": today,
        "count": len(records),
        "records": [
            {
                "user_id": user.user_id,               
                "time": attendance.time.strftime("%H:%M:%S"),
            }
            for attendance, user in records
        ],
    }


# ------------------ GET TODAY ATTENDANCE BY CLASSROOM ------------------

@router.get("/today/classroom/{classroom_id}")
def get_today_attendance_by_classroom(
    db: Session = Depends(get_db),
):
    today = date.today()

    records = (
        db.query(Attendance, User)
        .join(User, Attendance.user_id == User.user_id)
        .filter(
            Attendance.date == today,
        )
        .all()
    )

    return {
        "date": today,
        "count": len(records),
        "records": [
            {
                "user_id": user.user_id,
                "time": attendance.time.strftime("%H:%M:%S"),
            }
            for attendance, user in records
        ],
    }


# ------------------ DELETE TODAY ATTENDANCE FOR USER ------------------

@router.delete("/today/{user_id}")
def delete_today_attendance_for_user(
    user_id: str,
    db: Session = Depends(get_db),
):
    today = date.today()

    record = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == user_id,
            Attendance.date == today
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found for today"
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Today's attendance deleted",
        "user_id": user_id,
        "date": today,
    }


# ------------------ DELETE ALL TODAY ATTENDANCE ------------------

@router.delete("/today")
def delete_all_today_attendance(db: Session = Depends(get_db)):
    today = date.today()

    records = db.query(Attendance).filter(Attendance.date == today).all()

    if not records:
        return {
            "message": "No attendance records for today",
            "count": 0,
        }

    count = len(records)

    for record in records:
        db.delete(record)

    db.commit()

    return {
        "message": "All today's attendance deleted",
        "count": count,
    }


# ------------------ DELETE ALL ATTENDANCE FOR USER ------------------

@router.delete("/user/{user_id}")
def delete_all_attendance_for_user(
    user_id: str,
    db: Session = Depends(get_db),
):
    records = db.query(Attendance).filter(
        Attendance.user_id == user_id
    ).all()

    if not records:
        raise HTTPException(
            status_code=404,
            detail="No attendance records found for this user"
        )

    count = len(records)

    for record in records:
        db.delete(record)

    db.commit()

    return {
        "message": "All attendance records deleted for user",
        "user_id": user_id,
        "count": count,
    }
