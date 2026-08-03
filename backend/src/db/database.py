# backend/src/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from core.config import settings

DATABASE_URL = settings.DATABASE_URL

engine_kwargs = {}

if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {
        "check_same_thread": False,
    }
else:
    engine_kwargs.update(
        {
            # Verify pooled connections before using them.
            "pool_pre_ping": True,
            # Recycle connections periodically so Neon doesn't
            # hand back a closed idle connection.
            "pool_recycle": 300,
            # Optional: avoid holding too many idle connections.
            "pool_size": 5,
            "max_overflow": 10,
        }
    )

engine = create_engine(
    DATABASE_URL,
    **engine_kwargs,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()
