import os
import shutil
import tempfile
from pathlib import Path

import numpy as np
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from core.config import settings
from core.embedding_manager import generate_embedding
from db.database import get_db
from db.models import User
from utils.storage import storage

router = APIRouter(prefix="/recognize", tags=["Recognition"])

# ---------------------------------------------------
# CONFIG
# ---------------------------------------------------

THRESHOLD = settings.MATCH_THRESHOLD

# ---------------------------------------------------
# EMBEDDING CACHE
# user_id -> embedding metadata
# ---------------------------------------------------

EMBEDDING_CACHE = {}


# ---------------------------------------------------
# COSINE DISTANCE
# ---------------------------------------------------


def cosine_distance(a, b):
    a = np.array(a)
    b = np.array(b)

    return 1 - (np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


# ---------------------------------------------------
# GET STORED EMBEDDING
# VERSION-AWARE + CACHED
# ---------------------------------------------------


def get_stored_embedding(user: User):
    """
    Returns the stored embedding.

    Cached embeddings are reused whenever the embedding
    version matches the current application version.

    If no cache exists, the face image is downloaded from
    Supabase Storage, embedded, cached and returned.
    """

    cached = EMBEDDING_CACHE.get(user.user_id)

    if cached and cached["embedding_version"] == settings.EMBEDDING_VERSION:
        return cached

    temp_path = None

    try:
        image_bytes = storage.download_face(
            user.face_image_key,
        )

        suffix = Path(user.face_image_key).suffix or ".jpg"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:
            temp_file.write(image_bytes)
            temp_file.flush()

            temp_path = temp_file.name

        embedding_data = generate_embedding(temp_path)

        if embedding_data is None:
            return None

        EMBEDDING_CACHE[user.user_id] = embedding_data

        return embedding_data

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


# ---------------------------------------------------
# ROUTE
# ---------------------------------------------------


@router.post("/")
def recognize_user(
    user_id: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # ---------------------------------------------------
    # FETCH USER
    # ---------------------------------------------------

    user = db.query(User).filter(User.user_id == user_id).first()

    if not user or not user.face_image_key:
        raise HTTPException(
            status_code=404,
            detail="User not registered",
        )

    # ---------------------------------------------------
    # EMBEDDING VERSION VALIDATION
    # ---------------------------------------------------

    if user.embedding_version != settings.EMBEDDING_VERSION:
        return {
            "verified": False,
            "reason": "OUTDATED_EMBEDDING",
            "required_version": settings.EMBEDDING_VERSION,
            "current_version": user.embedding_version,
        }

    # ---------------------------------------------------
    # SAVE TEMP IMAGE
    # ---------------------------------------------------

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(image.file, tmp)

        tmp.flush()

        os.fsync(tmp.fileno())

        input_path = tmp.name

    try:
        # ---------------------------------------------------
        # GENERATE INPUT EMBEDDING
        # ---------------------------------------------------

        input_embedding_data = generate_embedding(input_path)

        if input_embedding_data is None:
            return {
                "verified": False,
                "reason": "NO_FACE_DETECTED",
            }

        input_embedding = input_embedding_data["embedding"]

        # ---------------------------------------------------
        # LOAD STORED EMBEDDING
        # ---------------------------------------------------

        stored_embedding_data = get_stored_embedding(user)

        if stored_embedding_data is None:
            raise HTTPException(
                status_code=400,
                detail="Stored face invalid",
            )

        stored_embedding = stored_embedding_data["embedding"]

        # ---------------------------------------------------
        # COMPARE
        # ---------------------------------------------------

        distance = cosine_distance(input_embedding, stored_embedding)

        verified = bool(distance <= THRESHOLD)

        # ---------------------------------------------------
        # RESPONSE
        # ---------------------------------------------------

        return {
            "verified": verified,
            "user_id": user.user_id,
            "distance": float(distance),
            "threshold": THRESHOLD,
            "embedding_version": settings.EMBEDDING_VERSION,
            "model": settings.MODEL_NAME,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=(f"Face verification failed. Internal error: {str(e)}"),
        )

    finally:
        if os.path.exists(input_path):
            os.remove(input_path)
