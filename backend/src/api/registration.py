# backend/src/api/registration.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from pathlib import Path
import shutil

from db.database import get_db
from db.models import User, UserRole
from core.config import settings
from core.dependencies import get_current_admin

router = APIRouter(prefix="/register", tags=["Registration"])

# ---------------------------------------------------
# CONFIG
# ---------------------------------------------------

FACE_DIR: Path = settings.RAW_FACES_DIR
FACE_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


# ---------------------------------------------------
# UTIL FUNCTIONS
# ---------------------------------------------------

def validate_image_extension(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Only JPG, JPEG, PNG allowed.",
        )
    return ext


def get_image_path(user_id: str, ext: str) -> Path:
    return FACE_DIR / f"{user_id}{ext}"


# ---------------------------------------------------
# ROUTES
# ---------------------------------------------------

@router.post("/")
def register_user(
    user_id: str = Form(...),
    classroom_id: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    # -------------------- CHECK EXISTING USER --------------------
    existing_user = db.query(User).filter(User.user_id == user_id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered",
        )

    # -------------------- VALIDATE FILE --------------------
    ext = validate_image_extension(image.filename)

    image_path: Path = get_image_path(user_id, ext)

    # -------------------- SAVE FILE --------------------
    try:
        image.file.seek(0)

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)  # ✅ FIXED

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image file: {str(e)}",
        )

    # -------------------- SAVE USER --------------------
    try:
        user = User(
            user_id=user_id,
            classroom_id=classroom_id,
            face_image_path=str(image_path.resolve()),  # ✅ ABSOLUTE PATH
            role=UserRole.USER,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()

        # cleanup file
        if image_path.exists():
            image_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user",
        )

    # -------------------- RESPONSE --------------------
    return {
        "message": "User registered successfully",
        "user_id": user.user_id,
        "classroom_id": user.classroom_id,
        "created_at": user.created_at,
    }


# ---------------------------------------------------
# GET ALL USERS
# ---------------------------------------------------

@router.get("/users")
def get_all_registered_users(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
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
                "created_at": user.created_at,
            }
            for user in users
        ],
    }