# backend/src/utils/time_utils.py

from datetime import datetime


def get_current_date() -> str:
    """
    Returns current date in YYYY-MM-DD format.
    """
    return datetime.now().strftime("%Y-%m-%d")


def get_current_time() -> str:
    """
    Returns current time in HH:MM:SS format.
    """
    return datetime.now().strftime("%H:%M:%S")


def get_current_datetime() -> str:
    """
    Returns current datetime in ISO format.
    """
    return datetime.now().isoformat()
