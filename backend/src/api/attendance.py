from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, datetime

from db.database import get_db
from db.models import Attendance, User

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ------------------ MARK ATTENDANCE ------------------

@router.post("/mark/{user_id}")
def mark_attendance(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    # 1️⃣ Ensure user exists in this classroom
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

    today = date.today()

    # 2️⃣ Prevent duplicate attendance (per classroom)
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

    # 3️⃣ Create attendance record
    attendance = Attendance(
        user_id=user.user_id,
        classroom_id=classroom_id,
        date=today,
        time=datetime.now().time(),
    )

    db.add(attendance)
    db.commit()

    return {
        "message": "Attendance marked successfully",
        "user_id": user_id,
        "classroom_id": classroom_id,
        "date": today,
    }


# ------------------ GET TODAY ATTENDANCE (CLASSROOM) ------------------

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
            User.classroom_id == classroom_id
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

# ------------------ GET ATTENDANCE BY DATE (CLASSROOM) ------------------

@router.get("/by-date")
def get_attendance_by_date(
    classroom_id: str = Query(...),
    attendance_date: date = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Attendance, User)
        .join(User, Attendance.user_id == User.user_id)
        .filter(
            Attendance.date == attendance_date,
            Attendance.classroom_id == classroom_id,
            User.classroom_id == classroom_id
        )
        .all()
    )

    if not records:
        return {
            "date": attendance_date,
            "classroom_id": classroom_id,
            "count": 0,
            "records": [],
        }

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

# ------------------ GET ALL ATTENDANCE (CLASSROOM | ALL DATES) ------------------

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
            User.classroom_id == classroom_id
        )
        .order_by(Attendance.date.desc(), Attendance.time.asc())
        .all()
    )

    if not records:
        return {
            "classroom_id": classroom_id,
            "count": 0,
            "records": [],
        }

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

# ------------------ GET DAY-WISE ATTENDANCE STATUS (USER | CLASSROOM) ------------------

@router.get("/status/{user_id}")
def get_day_wise_attendance_status(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    # 1️⃣ Ensure user exists in classroom
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

    # 2️⃣ Get all distinct attendance dates for the classroom
    all_dates = (
        db.query(Attendance.date)
        .filter(Attendance.classroom_id == classroom_id)
        .distinct()
        .order_by(Attendance.date)
        .all()
    )

    # 3️⃣ Get all dates where this user was present
    present_dates = (
        db.query(Attendance.date)
        .filter(
            Attendance.user_id == user_id,
            Attendance.classroom_id == classroom_id
        )
        .all()
    )

    present_dates_set = {d[0] for d in present_dates}

    # 4️⃣ Build day-wise status
    records = []
    for (att_date,) in all_dates:
        records.append({
            "date": att_date,
            "status": "PRESENT" if att_date in present_dates_set else "ABSENT",
        })

    return {
        "user_id": user_id,
        "classroom_id": classroom_id,
        "total_days": len(all_dates),
        "present_days": len(present_dates_set),
        "absent_days": len(all_dates) - len(present_dates_set),
        "records": records,
    }


# ------------------ DELETE TODAY ATTENDANCE FOR USER (CLASSROOM) ------------------

@router.delete("/today/{user_id}")
def delete_today_attendance_for_user(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
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
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found for today in this classroom"
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Today's attendance deleted",
        "user_id": user_id,
        "classroom_id": classroom_id,
        "date": today,
    }


# ------------------ DELETE ALL TODAY ATTENDANCE (CLASSROOM) ------------------

@router.delete("/today")
def delete_all_today_attendance(
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
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

    if not records:
        return {
            "message": "No attendance records for today",
            "classroom_id": classroom_id,
            "count": 0,
        }

    count = len(records)

    for record in records:
        db.delete(record)

    db.commit()

    return {
        "message": "All today's attendance deleted",
        "classroom_id": classroom_id,
        "count": count,
    }


# ------------------ DELETE ALL ATTENDANCE FOR USER (CLASSROOM) ------------------

@router.delete("/user/{user_id}")
def delete_all_attendance_for_user(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
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
        raise HTTPException(
            status_code=404,
            detail="No attendance records found for this user in this classroom"
        )

    count = len(records)

    for record in records:
        db.delete(record)

    db.commit()

    return {
        "message": "All attendance records deleted for user",
        "user_id": user_id,
        "classroom_id": classroom_id,
        "count": count,
    }
