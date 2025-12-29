# backend/src/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# -------------------- DATABASE URL --------------------
# Example:
# SQLite  -> sqlite:///./attendance.db
# Postgres-> postgresql://user:password@localhost/dbname

DATABASE_URL = (
    settings.__dict__.get("DATABASE_URL")
    if hasattr(settings, "DATABASE_URL")
    else "sqlite:///./attendance.db"
)

# -------------------- ENGINE --------------------
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

# -------------------- SESSION --------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# -------------------- BASE --------------------
Base = declarative_base()


# -------------------- DEPENDENCY --------------------
def get_db():
    """
    FastAPI dependency to get DB session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
