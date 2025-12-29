from fastapi import APIRouter, Depends, HTTPException, Query
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
    Returns ISO-8601 UTC timestamp
    """
    return {
        "user_id": user.user_id,
        "face_image_path": user.face_image_path,
        "created_at": (
            user.created_at.isoformat()
            if user.created_at is not None
            else None
        ),
    }


# ------------------ GET ENDPOINTS ------------------

@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    """
    Get a single user by user_id
    """
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user": serialize_user(user)
    }


@router.get("/")
def get_multiple_users(
    user_ids: List[str] = Query(None, description="List of user IDs"),
    db: Session = Depends(get_db),
):
    """
    Get multiple users by user_ids
    If no user_ids provided, return all users
    """
    query = db.query(User)

    if user_ids:
        query = query.filter(User.user_id.in_(user_ids))

    users = query.all()

    return {
        "users": [serialize_user(user) for user in users],
        "count": len(users),
    }


# ------------------ DELETE ENDPOINTS ------------------

@router.delete("/delete-all")
def delete_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    if not users:
        return {
            "message": "No users to delete",
            "count": 0,
        }

    for user in users:
        delete_face_image(user.face_image_path)
        db.delete(user)

    db.commit()

    return {
        "message": "All users deleted successfully",
        "count": len(users),
    }


@router.post("/delete-multiple")
def delete_multiple_users(user_ids: List[str], db: Session = Depends(get_db)):
    if not user_ids:
        raise HTTPException(status_code=400, detail="No user IDs provided")

    users = db.query(User).filter(User.user_id.in_(user_ids)).all()

    if not users:
        raise HTTPException(status_code=404, detail="No matching users found")

    deleted = []

    for user in users:
        delete_face_image(user.face_image_path)
        deleted.append(user.user_id)
        db.delete(user)

    db.commit()

    return {
        "message": "Users deleted successfully",
        "deleted_users": deleted,
        "count": len(deleted),
    }


@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    delete_face_image(user.face_image_path)
    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
        "user_id": user_id,
    }
