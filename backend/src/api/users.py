import os
from pathlib import Path
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from core.config import settings
from core.dependencies import get_current_admin
from db.database import get_db
from db.models import User, UserRole

router = APIRouter(prefix="/users", tags=["Users"])


# ------------------ UTILS ------------------


def delete_face_image(path: str):
    if not path:
        return

    try:
        # ✅ Ensure string
        raw_path = str(path)

        # ✅ Normalize Windows → Linux
        normalized_path = raw_path.replace("\\", "/")

        # ✅ Try original path first
        file_path = Path(normalized_path)

        if file_path.exists():
            file_path.unlink()
            print(f"[INFO] Deleted image: {file_path}")
            return

        # 🔥 Fallback (VERY IMPORTANT)
        filename = os.path.basename(normalized_path)

        fallback_path = settings.RAW_FACES_DIR / filename

        if fallback_path.exists():
            fallback_path.unlink()
            print(f"[INFO] Deleted image (fallback): {fallback_path}")
            return

        print(f"[WARN] Image not found for deletion: {path}")

    except Exception as e:
        print(f"[ERROR] Failed to delete image {path}: {e}")


def serialize_user(user: User):
    return {
        "user_id": user.user_id,
        "classroom_id": user.classroom_id,
        "face_image_key": user.face_image_key,
        "created_at": (user.created_at.isoformat() if user.created_at else None),
    }


# ------------------ READ ENDPOINTS ------------------


@router.get("/{user_id}/")
def get_user(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.classroom_id == classroom_id,
            User.role == UserRole.USER,
        )
        .first()
    )

    if not user:
        raise HTTPException(404, "User not found in this classroom")

    return {"user": serialize_user(user)}


@router.get("/")
def get_multiple_users(
    classroom_id: str = Query(...),
    user_ids: List[str] | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(User).filter(
        User.classroom_id == classroom_id, User.role == UserRole.USER
    )

    if user_ids:
        query = query.filter(User.user_id.in_(user_ids))

    users = query.all()

    return {
        "classroom_id": classroom_id,
        "users": [serialize_user(u) for u in users],
        "count": len(users),
    }


@router.get("/{user_id}/image/")
def get_user_face_image(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.classroom_id == classroom_id,
            User.role == UserRole.USER,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in this classroom",
        )

    if not user.face_image_key:
        raise HTTPException(
            status_code=404,
            detail="User has no face image",
        )

    # Normalize stored path
    normalized_path = str(user.face_image_key).replace("\\", "/")

    # Extract filename only
    filename = Path(normalized_path).name

    if not filename:
        raise HTTPException(
            status_code=500,
            detail="Invalid face image path",
        )

    # Canonical runtime location
    image_path = settings.RAW_FACES_DIR / filename

    if not image_path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Image file missing on server: {image_path}",
        )

    return FileResponse(
        path=str(image_path),
        media_type="image/jpeg",
        filename=image_path.name,
    )


# ------------------ ADMIN DELETE ENDPOINTS ------------------


@router.delete("/admin/delete-all/")
def delete_all_users(
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    users = (
        db.query(User)
        .filter(User.classroom_id == classroom_id, User.role == UserRole.USER)
        .all()
    )

    if not users:
        return {"message": "No users to delete", "count": 0}

    for user in users:
        delete_face_image(user.face_image_key)
        db.delete(user)

    db.commit()

    return {
        "message": "All users deleted successfully",
        "classroom_id": classroom_id,
        "count": len(users),
    }


@router.post("/admin/delete-multiple/")
def delete_multiple_users(
    user_ids: List[str] = Body(..., embed=True),
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    users = (
        db.query(User)
        .filter(
            User.classroom_id == classroom_id,
            User.user_id.in_(user_ids),
            User.role == UserRole.USER,
        )
        .all()
    )

    if not users:
        raise HTTPException(404, "No matching users found")

    deleted = []

    for user in users:
        delete_face_image(user.face_image_key)
        deleted.append(user.user_id)
        db.delete(user)

    db.commit()

    return {
        "message": "Users deleted successfully",
        "deleted_users": deleted,
        "count": len(deleted),
    }


@router.delete("/admin/{user_id}/")
def delete_user(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.classroom_id == classroom_id,
            User.role == UserRole.USER,
        )
        .first()
    )

    if not user:
        raise HTTPException(404, "User not found")

    # ✅ Delete image FIRST
    delete_face_image(user.face_image_key)

    # ✅ Then delete DB record
    db.delete(user)
    db.commit()

    return {
        "message": "User and face image deleted successfully",
        "user_id": user_id,
    }
