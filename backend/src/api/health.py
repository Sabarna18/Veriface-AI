# backend/src/api/health.py

from fastapi import APIRouter
from core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/")
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "debug": settings.DEBUG
    }
