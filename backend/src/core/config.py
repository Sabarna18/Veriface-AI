# backend/src/core/config.py

from pydantic_settings import BaseSettings
from pathlib import Path
import os
from datetime import timedelta
from pydantic_settings import BaseSettings
from typing import ClassVar

BASE_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    # -------------------- APP --------------------
    APP_NAME: str = "Face Attendance System"
    DEBUG: bool = True

    # -------------------- PATHS --------------------
    DATA_DIR: Path = BASE_DIR / "backend" / "data"
    RAW_FACES_DIR: Path = DATA_DIR / "raw" / "registrations"
    ALIGNED_FACES_DIR: Path = DATA_DIR / "processed" / "aligned_faces"
    EMBEDDINGS_DIR: Path = DATA_DIR / "embeddings"
    ATTENDANCE_DIR: Path = DATA_DIR / "attendance"

    EMBEDDINGS_FILE: Path = EMBEDDINGS_DIR / "face_embeddings.pkl"
    ATTENDANCE_FILE: Path = ATTENDANCE_DIR / "attendance_log.csv"

    # -------------------- FACE RECOGNITION --------------------
    MODEL_NAME: str = "ArcFace"
    DETECTOR_BACKEND: str = "opencv"
    DISTANCE_METRIC: str = "cosine"
    MATCH_THRESHOLD: float = 0.68

    # -------------------- CAMERA --------------------
    CAMERA_INDEX: int = 0
    FRAME_WIDTH: int = 640
    FRAME_HEIGHT: int = 480
    
    SECRET_KEY: str = "dev-secret-change-this"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day


    class Config:
        env_file = ".env"


settings = Settings()

# Ensure directories exist
settings.RAW_FACES_DIR.mkdir(parents=True, exist_ok=True)
settings.ALIGNED_FACES_DIR.mkdir(parents=True, exist_ok=True)
settings.EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
settings.ATTENDANCE_DIR.mkdir(parents=True, exist_ok=True)
