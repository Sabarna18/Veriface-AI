from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os

from db.database import get_db
from db.models import User

router = APIRouter(prefix="/users", tags=["Users"])


# ------------------ UTILS ------------------

def delete_face_image(path: str):
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except Exception:
            pass


def serialize_user(user: User):
    """
    Convert SQLAlchemy User model to JSON-serializable dict
    """
    return {
        "user_id": user.user_id,
        "classroom_id": user.classroom_id,
        "face_image_path": user.face_image_path,
        "created_at": (
            user.created_at.isoformat()
            if user.created_at is not None
            else None
        ),
    }


# ------------------ GET ENDPOINTS ------------------

@router.get("/{user_id}")
def get_user(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    """
    Get a single user by user_id within a classroom
    """
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.classroom_id == classroom_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in this classroom"
        )

    return {
        "user": serialize_user(user)
    }


@router.get("/")
def get_multiple_users(
    classroom_id: str = Query(...),
    user_ids: List[str] = Query(
        None,
        description="Optional list of user IDs"
    ),
    db: Session = Depends(get_db),
):
    """
    Get users within a classroom.
    If user_ids provided, filter by those IDs.
    """
    query = db.query(User).filter(
        User.classroom_id == classroom_id
    )

    if user_ids:
        query = query.filter(User.user_id.in_(user_ids))

    users = query.all()

    return {
        "classroom_id": classroom_id,
        "users": [serialize_user(user) for user in users],
        "count": len(users),
    }


# ------------------ DELETE ENDPOINTS ------------------

@router.delete("/delete-all")
def delete_all_users(
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .filter(User.classroom_id == classroom_id)
        .all()
    )

    if not users:
        return {
            "message": "No users to delete",
            "classroom_id": classroom_id,
            "count": 0,
        }

    for user in users:
        delete_face_image(user.face_image_path)
        db.delete(user)

    db.commit()

    return {
        "message": "All users deleted successfully",
        "classroom_id": classroom_id,
        "count": len(users),
    }


@router.post("/delete-multiple")
def delete_multiple_users(
    user_ids: List[str],
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    if not user_ids:
        raise HTTPException(
            status_code=400,
            detail="No user IDs provided"
        )

    users = (
        db.query(User)
        .filter(
            User.classroom_id == classroom_id,
            User.user_id.in_(user_ids)
        )
        .all()
    )

    if not users:
        raise HTTPException(
            status_code=404,
            detail="No matching users found in this classroom"
        )

    deleted = []

    for user in users:
        delete_face_image(user.face_image_path)
        deleted.append(user.user_id)
        db.delete(user)

    db.commit()

    return {
        "message": "Users deleted successfully",
        "classroom_id": classroom_id,
        "deleted_users": deleted,
        "count": len(deleted),
    }


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.classroom_id == classroom_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in this classroom"
        )

    delete_face_image(user.face_image_path)
    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
        "user_id": user_id,
        "classroom_id": classroom_id,
    }


@router.get("/{user_id}/image")
def get_user_face_image(
    user_id: str,
    classroom_id: str = Query(...),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.user_id == user_id,
            User.classroom_id == classroom_id
        )
        .first()
    )

    if not user or not user.face_image_path:
        raise HTTPException(status_code=404, detail="Image not found")

    if not os.path.exists(user.face_image_path):
        raise HTTPException(status_code=404, detail="Image file missing")

    response = FileResponse(
        user.face_image_path,
        media_type="image/jpeg",
        filename=os.path.basename(user.face_image_path),
    )

    # 🔥 Explicit CORS headers (critical)
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"

    return response
