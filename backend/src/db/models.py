from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Time,
    ForeignKey,
    DateTime,
)
from sqlalchemy.sql import func
from .database import Base


# -------------------- USER --------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

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

    face_image_path = Column(String,
                            nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    def __repr__(self):
        return (
            f"<User user_id={self.user_id} "
            f"classroom_id={self.classroom_id}>"
        )


# -------------------- ATTENDANCE --------------------
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        String,
        ForeignKey("users.user_id"),
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
