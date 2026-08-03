from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # ==========================================================
    # Application
    # ==========================================================

    APP_NAME: str = "VeriFace AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    API_ROOT_PATH: str = "/api/v1"

    # ==========================================================
    # CORS
    # ==========================================================

    CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: [
            "http://localhost",
            "http://localhost:3000",
            "http://localhost:5173",
        ]
    )

    # ==========================================================
    # Database
    # ==========================================================

    DATABASE_URL: str = Field(
        ...,
        description="SQLAlchemy database connection string",
    )

    # ==========================================================
    # Application Storage
    # ==========================================================

    DATA_DIR: Path = BASE_DIR / "data"

    @property
    def RAW_FACES_DIR(self) -> Path:
        return self.DATA_DIR / "raw" / "registrations"

    @property
    def ALIGNED_FACES_DIR(self) -> Path:
        return self.DATA_DIR / "processed" / "aligned_faces"

    @property
    def EMBEDDINGS_DIR(self) -> Path:
        return self.DATA_DIR / "embeddings"

    @property
    def ATTENDANCE_DIR(self) -> Path:
        return self.DATA_DIR / "attendance"

    @property
    def EMBEDDINGS_FILE(self) -> Path:
        return self.EMBEDDINGS_DIR / "face_embeddings.pkl"

    @property
    def ATTENDANCE_FILE(self) -> Path:
        return self.ATTENDANCE_DIR / "attendance_log.csv"

    # ==========================================================
    # Supabase Storage
    # ==========================================================

    SUPABASE_URL: str = Field(
        ...,
        description="Supabase project URL",
    )

    SUPABASE_SERVICE_ROLE_KEY: str = Field(
        ...,
        description="Supabase service role key",
    )

    SUPABASE_BUCKET: str = Field(
        default="face-images",
        description="Supabase storage bucket",
    )

    # ==========================================================
    # Face Recognition
    # ==========================================================

    MODEL_NAME: str = "ArcFace"
    DETECTOR_BACKEND: str = "opencv"
    DISTANCE_METRIC: str = "cosine"
    MATCH_THRESHOLD: float = 0.50
    EMBEDDING_VERSION: str = "arcface_v1"

    # ==========================================================
    # Camera
    # ==========================================================

    CAMERA_INDEX: int = 0
    FRAME_WIDTH: int = 640
    FRAME_HEIGHT: int = 480

    # ==========================================================
    # Authentication
    # ==========================================================

    SECRET_KEY: str = Field(
        ...,
        description="JWT secret key",
    )

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ==========================================================
    # Pydantic Settings
    # ==========================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


def initialize_directories() -> None:
    directories = (
        settings.RAW_FACES_DIR,
        settings.ALIGNED_FACES_DIR,
        settings.EMBEDDINGS_DIR,
        settings.ATTENDANCE_DIR,
    )

    for directory in directories:
        directory.mkdir(
            parents=True,
            exist_ok=True,
        )


settings = Settings()
