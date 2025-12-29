# backend/tests/test_attendance.py

import sys
from pathlib import Path

# -------------------- PATH FIX --------------------
BASE_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = BASE_DIR / "src"
sys.path.append(str(SRC_DIR))

# -------------------- IMPORTS --------------------
from core.attendance_manager import AttendanceManager


def test_mark_attendance():
    """
    Test marking attendance for a user.
    """
    manager = AttendanceManager()

    user_id = "test_user_attendance"

    first_mark = manager.mark_attendance(user_id)
    second_mark = manager.mark_attendance(user_id)

    assert first_mark is True
    assert second_mark is False


def test_get_today_attendance():
    """
    Test fetching today's attendance records.
    """
    manager = AttendanceManager()
    records = manager.get_today_attendance()

    assert isinstance(records, list)
