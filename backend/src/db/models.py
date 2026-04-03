from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Time,
    ForeignKey,
    DateTime,
    Boolean,
    Enum,
    LargeBinary
)
from sqlalchemy.sql import func
from .database import Base
import enum
from datetime import datetime
import pytz

# -------------------- ROLES --------------------

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"   # student
    
IST = pytz.timezone("Asia/Kolkata")


# -------------------- USER --------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Logical identifier (student ID or admin ID)
    user_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    classroom_id = Column(
        String,
        nullable=False,
        index=True
    )

    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.USER
    )

    # Admin-only (NULL for students)
    hashed_password = Column(
        String,
        nullable=True
    )

    face_image_path = Column(
        String,
        nullable=True
    )

    # face_embedding = Column(LargeBinary, nullable=True)

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(IST),
        nullable=False
    )

    def __repr__(self):
        return (
            f"<User user_id={self.user_id} "
            f"role={self.role} "
            f"classroom_id={self.classroom_id}>"
        )


# -------------------- ATTENDANCE --------------------

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    classroom_id = Column(
        String,
        nullable=False,
        index=True
    )

    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)

    def __repr__(self):
        return (
            f"<Attendance user_id={self.user_id} "
            f"classroom_id={self.classroom_id} "
            f"date={self.date}>"
        )
