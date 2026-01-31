from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, datetime, timezone
import pytz
from core.dependencies import get_current_admin
from db.database import get_db
from db.models import Attendance, User, UserRole

router = APIRouter(prefix="/attendance", tags=["Attendance"])
IST = pytz.timezone("Asia/Kolkata")

# ------------------ MARK ATTENDANCE (STUDENT) ------------------

@router.post("/mark/{user_id}")
def mark_attendance(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    # Ensure USER exists in this classroom (NOT admin)
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.classroom_id == classroom_id,
            User.role == UserRole.USER
        )
        .first()
    )

    if not user:
        raise HTTPException(404, "User not found in this classroom")

    today = date.today()

    # Prevent duplicate attendance
    exists = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == user_id,
            Attendance.classroom_id == classroom_id,
            Attendance.date == today
        )
        .first()
    )

    if exists:
        return {
            "message": "Attendance already marked for today",
            "user_id": user_id,
            "classroom_id": classroom_id,
        }

    attendance = Attendance(
        user_id=user.user_id,
        classroom_id=classroom_id,
        date=today,
        time=datetime.now(IST).time(),
    )

    db.add(attendance)
    db.commit()

    return {
        "message": "Attendance marked successfully",
        "user_id": user_id,
        "classroom_id": classroom_id,
        "date": today,
    }


# ------------------ READ ATTENDANCE (PUBLIC) ------------------

@router.get("/today")
def get_today_attendance(
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    today = date.today()

    records = (
        db.query(Attendance, User)
        .join(User, Attendance.user_id == User.user_id)
        .filter(
            Attendance.date == today,
            Attendance.classroom_id == classroom_id,
            User.classroom_id == classroom_id,
            User.role == UserRole.USER
        )
        .all()
    )

    return {
        "date": today,
        "classroom_id": classroom_id,
        "count": len(records),
        "records": [
            {
                "user_id": user.user_id,
                "time": attendance.time.strftime("%H:%M:%S"),
            }
            for attendance, user in records
        ],
    }


@router.get("/by-date")
def get_attendance_by_date(
    classroom_id: str = Query(...),
    attendance_date: date = Query(...),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Attendance, User)
        .join(User, Attendance.user_id == User.user_id)
        .filter(
            Attendance.date == attendance_date,
            Attendance.classroom_id == classroom_id,
            User.classroom_id == classroom_id,
            User.role == UserRole.USER
        )
        .all()
    )

    return {
        "date": attendance_date,
        "classroom_id": classroom_id,
        "count": len(records),
        "records": [
            {
                "user_id": user.user_id,
                "time": attendance.time.strftime("%H:%M:%S"),
            }
            for attendance, user in records
        ],
    }


@router.get("/all")
def get_all_attendance_for_classroom(
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Attendance, User)
        .join(User, Attendance.user_id == User.user_id)
        .filter(
            Attendance.classroom_id == classroom_id,
            User.classroom_id == classroom_id,
            User.role == UserRole.USER
        )
        .order_by(Attendance.date.desc(), Attendance.time.asc())
        .all()
    )

    return {
        "classroom_id": classroom_id,
        "count": len(records),
        "records": [
            {
                "user_id": user.user_id,
                "date": attendance.date,
                "time": attendance.time.strftime("%H:%M:%S"),
            }
            for attendance, user in records
        ],
    }


@router.get("/status/{user_id}")
def get_day_wise_attendance_status(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.classroom_id == classroom_id,
            User.role == UserRole.USER
        )
        .first()
    )

    if not user:
        raise HTTPException(404, "User not found in this classroom")

    all_dates = (
        db.query(Attendance.date)
        .filter(Attendance.classroom_id == classroom_id)
        .distinct()
        .order_by(Attendance.date)
        .all()
    )

    present_dates = (
        db.query(Attendance.date)
        .filter(
            Attendance.user_id == user_id,
            Attendance.classroom_id == classroom_id
        )
        .all()
    )

    present_set = {d[0] for d in present_dates}

    records = [
        {
            "date": att_date,
            "status": "PRESENT" if att_date in present_set else "ABSENT",
        }
        for (att_date,) in all_dates
    ]

    return {
        "user_id": user_id,
        "classroom_id": classroom_id,
        "total_days": len(all_dates),
        "present_days": len(present_set),
        "absent_days": len(all_dates) - len(present_set),
        "records": records,
    }


# ------------------ ADMIN DELETE ENDPOINTS ------------------

@router.delete("/admin/today/{user_id}")
def delete_today_attendance_for_user(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin),
):
    today = date.today()

    record = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == user_id,
            Attendance.classroom_id == classroom_id,
            Attendance.date == today
        )
        .first()
    )

    if not record:
        raise HTTPException(404, "Attendance record not found")

    db.delete(record)
    db.commit()

    return {
        "message": "Today's attendance deleted",
        "user_id": user_id,
        "classroom_id": classroom_id,
    }


@router.delete("/admin/today")
def delete_all_today_attendance(
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin),
):
    today = date.today()

    records = (
        db.query(Attendance)
        .filter(
            Attendance.date == today,
            Attendance.classroom_id == classroom_id
        )
        .all()
    )

    for record in records:
        db.delete(record)

    db.commit()

    return {
        "message": "All today's attendance deleted",
        "classroom_id": classroom_id,
        "count": len(records),
    }


@router.delete("/admin/user/{user_id}")
def delete_all_attendance_for_user(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin),
):
    records = (
        db.query(Attendance)
        .filter(
            Attendance.user_id == user_id,
            Attendance.classroom_id == classroom_id
        )
        .all()
    )

    if not records:
        raise HTTPException(404, "No attendance records found")

    for record in records:
        db.delete(record)

    db.commit()

    return {
        "message": "All attendance records deleted for user",
        "user_id": user_id,
        "count": len(records),
    }
