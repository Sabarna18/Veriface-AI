# backend/src/api/registration.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime , timezone
from db.database import get_db
from db.models import User
from core.config import settings

router = APIRouter(prefix="/register", tags=["Registration"])

FACE_DIR = "data/raw/registrations"
os.makedirs(FACE_DIR, exist_ok=True)


@router.post("/")
def register_user(
    user_id: str = Form(...),
    classroom_id: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # 1️⃣ Check if user exists
    existing = db.query(User).filter(User.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already registered")

    # 2️⃣ Save image
    image_path = os.path.join(FACE_DIR, f"{user_id}.jpg")
    with open(image_path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    # 3️⃣ Create DB record
    user = User(
        user_id=user_id,
        classroom_id=classroom_id,
        face_image_path=image_path,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": user.user_id,
        "classroom_id": user.classroom_id,
        "created_at": user.created_at
    }
    
@router.get("/users")
def get_all_registered_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return {
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "user_id": user.user_id,
                "classroom_id": user.classroom_id,
                "face_image_path": user.face_image_path,
                "created_at": user.created_at
            }
            for user in users
        ],
    }
