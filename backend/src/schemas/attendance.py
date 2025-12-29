# backend/src/schemas/attendance.py

from pydantic import BaseModel, Field
from typing import List


# -------------------- ATTENDANCE RECORD --------------------

class AttendanceRecord(BaseModel):
    """
    Single attendance entry.
    """
    user_id: str = Field(..., example="student_001")
    date: str = Field(..., example="2025-01-18")
    time: str = Field(..., example="09:31:12")


# -------------------- MARK RESPONSE --------------------

class AttendanceMarkResponse(BaseModel):
    """
    Response after marking attendance.
    """
    message: str = Field(example="Attendance marked successfully")
    user_id: str = Field(example="student_001")


# -------------------- TODAY ATTENDANCE --------------------

class TodayAttendanceResponse(BaseModel):
    """
    Response for today's attendance list.
    """
    date: str = Field(example="2025-01-18")
    records: List[AttendanceRecord]
