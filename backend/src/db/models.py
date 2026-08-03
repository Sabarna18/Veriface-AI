import enum
from datetime import datetime

import pytz
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Time,
)

from .database import Base

# ==========================================================
# User Roles
# ==========================================================


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"


IST = pytz.timezone("Asia/Kolkata")


# ==========================================================
# Users
# ==========================================================


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Student/Admin identifier
    user_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    classroom_id = Column(
        String,
        nullable=False,
        index=True,
    )

    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.USER,
    )

    # Admin credentials (NULL for students)
    hashed_password = Column(String, nullable=True)

    # ------------------------------------------------------
    # Supabase Storage Object Key
    #
    # Example:
    # registrations/CSBSX_026.jpg
    #
    # This is NOT a local filesystem path and NOT a full URL.
    # The backend generates download URLs from this key.
    # ------------------------------------------------------
    face_image_key = Column(
        String,
        nullable=True,
    )

    embedding_version = Column(String, nullable=True)
    embedding_model = Column(String, nullable=True)
    embedding_created_at = Column(DateTime, nullable=True)

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(IST),
        nullable=False,
    )

    def __repr__(self):
        return (
            f"<User("
            f"user_id={self.user_id}, "
            f"classroom_id={self.classroom_id}, "
            f"role={self.role}"
            f")>"
        )


# ==========================================================
# Attendance
# ==========================================================


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        String,
        ForeignKey(
            "users.user_id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    classroom_id = Column(
        String,
        nullable=False,
        index=True,
    )

    date = Column(
        Date,
        nullable=False,
    )

    time = Column(
        Time,
        nullable=False,
    )

    def __repr__(self):
        return (
            f"<Attendance("
            f"user_id={self.user_id}, "
            f"classroom_id={self.classroom_id}, "
            f"date={self.date}"
            f")>"
        )
