# backend/src/schemas/__init__.py

from .user import (
    UserRegisterRequest,
    UserRegisterResponse,
    RecognitionResponse,
)

from .attendance import (
    AttendanceMarkResponse,
    AttendanceRecord,
    TodayAttendanceResponse,
)
