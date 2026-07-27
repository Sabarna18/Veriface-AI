# backend/src/schemas/__init__.py

from .attendance import (
    AttendanceMarkResponse,
    AttendanceRecord,
    TodayAttendanceResponse,
)
from .user import (
    RecognitionResponse,
    UserRegisterRequest,
    UserRegisterResponse,
)

__all__ = [
    "AttendanceMarkResponse",
    "AttendanceRecord",
    "TodayAttendanceResponse",
    "RecognitionResponse",
    "UserRegisterRequest",
    "UserRegisterResponse",
]
