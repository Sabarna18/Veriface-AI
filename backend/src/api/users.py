from io import BytesIO
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.dependencies import get_current_admin
from db.database import get_db
from db.models import User, UserRole
from utils.storage import storage

router = APIRouter(prefix="/users", tags=["Users"])


# ------------------ UTILS ------------------


def delete_face_image(storage_key: str | None) -> None:
    """
    Delete a face image from Supabase Storage.

    Failure to delete the image should not prevent
    deletion of the user.
    """

    if not storage_key:
        return

    try:
        storage.delete_face(storage_key)

    except Exception as e:
        print(f"[WARN] Failed to delete face image " f"'{storage_key}': {e}")


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

    try:
        image_bytes = storage.download_face(
            user.face_image_key,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve face image: {e}",
        )

    return StreamingResponse(
        BytesIO(image_bytes),
        media_type="image/jpeg",
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
