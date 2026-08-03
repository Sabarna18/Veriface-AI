# backend/src/api/registration.py

import shutil
import tempfile
from datetime import datetime
from pathlib import Path

import pytz
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from core.config import settings
from core.dependencies import get_current_admin
from core.embedding_manager import generate_embedding
from db.database import get_db
from db.models import User, UserRole
from utils.storage import storage

router = APIRouter(
    prefix="/register",
    tags=["Registration"],
)

# ==========================================================
# CONFIG
# ==========================================================

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
}

IST = pytz.timezone("Asia/Kolkata")


# ==========================================================
# UTILITIES
# ==========================================================


def validate_image_extension(filename: str) -> str:
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Only JPG, JPEG and PNG are allowed.",
        )

    return ext


def create_temp_image(ext: str) -> Path:
    """
    Creates a temporary image file.

    The file is automatically deleted at the end
    of the request.
    """

    temp = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=ext,
    )

    temp.close()

    return Path(temp.name)


# ==========================================================
# REGISTER USER
# ==========================================================


@router.post("/")
def register_user(
    user_id: str = Form(...),
    classroom_id: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    # -------------------------------------------------------
    # CHECK EXISTING USER
    # -------------------------------------------------------

    existing_user = db.query(User).filter(User.user_id == user_id).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered",
        )

    # -------------------------------------------------------
    # VALIDATE IMAGE
    # -------------------------------------------------------

    ext = validate_image_extension(image.filename)

    temp_path = create_temp_image(ext)

    storage_key = None

    try:
        # ---------------------------------------------------
        # SAVE TEMP IMAGE
        # ---------------------------------------------------

        image.file.seek(0)

        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # ---------------------------------------------------
        # GENERATE EMBEDDING
        # ---------------------------------------------------

        embedding_data = generate_embedding(
            str(temp_path),
        )

        if embedding_data is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No face embedding generated.",
            )

        # ---------------------------------------------------
        # UPLOAD TO SUPABASE
        # ---------------------------------------------------

        storage_key = storage.upload_face(
            file_path=temp_path,
            classroom_id=classroom_id,
            user_id=user_id,
        )

        image = storage.download_face(storage_key)

        if not image:
            raise RuntimeError("Upload verification failed")

        # ---------------------------------------------------
        # SAVE USER
        # ---------------------------------------------------

        user = User(
            user_id=user_id,
            classroom_id=classroom_id,
            role=UserRole.USER,
            face_image_key=storage_key,
            embedding_version=settings.EMBEDDING_VERSION,
            embedding_model=settings.MODEL_NAME,
            embedding_created_at=datetime.now(IST),
        )

        db.add(user)
        user.face_image_key = storage_key
        db.commit()
        db.refresh(user)

    except HTTPException:
        db.rollback()

        if storage_key:
            storage.delete_face(storage_key)

        raise

    except Exception as e:
        db.rollback()

        if storage_key:
            storage.delete_face(storage_key)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )

    finally:
        if temp_path.exists():
            temp_path.unlink()

    # -------------------------------------------------------
    # RESPONSE
    # -------------------------------------------------------

    return {
        "message": "User registered successfully",
        "user_id": user.user_id,
        "classroom_id": user.classroom_id,
        "embedding_version": user.embedding_version,
        "embedding_model": user.embedding_model,
        "created_at": user.created_at,
    }


# ==========================================================
# GET ALL USERS
# ==========================================================


@router.get("/users/")
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
                "face_image_key": user.face_image_key,
                "created_at": user.created_at,
            }
            for user in users
        ],
    }
