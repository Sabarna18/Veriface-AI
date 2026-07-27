# backend/src/api/__init__.py

from .attendance import router as attendance_router
from .auth import router as auth_router
from .classroom import router as classroom_router
from .health import router as health_router
from .recognition import router as recognition_router
from .registration import router as registration_router
from .users import router as users_router

__all__ = [
    "health_router",
    "registration_router",
    "recognition_router",
    "attendance_router",
    "users_router",
    "classroom_router",
    "auth_router",
]
