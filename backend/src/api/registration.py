# backend/src/api/registration.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime , timezone
from db.database import get_db
from db.models import User , UserRole
from core.config import settings
from core.dependencies import get_current_admin

router = APIRouter(prefix="/register", tags=["Registration"])

FACE_DIR = os.path.join(settings.DATA_DIR, "data/raw/registrations")

os.makedirs(FACE_DIR, exist_ok=True)


@router.post("/")
def register_user(
    user_id: str = Form(...),
    classroom_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    existing = db.query(User).filter(User.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already registered")

    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
    ext = os.path.splitext(file.filename)[1]

    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Only JPG, JPEG, PNG allowed."
        )

    image_path = os.path.join(FACE_DIR, f"{user_id}{ext}")

    with open(image_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    user = User(
        user_id=user_id,
        classroom_id=classroom_id,
        face_image_path=image_path,
        role=UserRole.USER,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": user.user_id,
        "classroom_id": user.classroom_id,
        "created_at": user.created_at,
    }

    
@router.get("/users")
def get_all_registered_users(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    users = db.query(User).all()

    return {
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "user_id": user.user_id,
                "classroom_id": user.classroom_id,
                "role": user.role,
                "face_image_path": user.face_image_path,
                "created_at": user.created_at
            }
            for user in users
        ],
    }
