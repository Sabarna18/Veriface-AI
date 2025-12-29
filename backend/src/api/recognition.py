from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import tempfile, shutil, os
from deepface import DeepFace

from db.database import get_db
from db.models import User

router = APIRouter(prefix="/recognize", tags=["Recognition"])

THRESHOLD = 0.50
MODEL = "ArcFace"
METRIC = "cosine"
DETECTOR = "opencv"


@router.post("/")
def recognize_user(
    user_id: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user or not user.face_image_path:
        raise HTTPException(status_code=404, detail="User not registered")

    # ---- Save temp image safely ----
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(image.file, tmp)
        tmp.flush()
        os.fsync(tmp.fileno())
        input_path = tmp.name

    try:
        # ---- Verify ----
        result = DeepFace.verify(
            img1_path=input_path,
            img2_path=user.face_image_path,
            model_name=MODEL,
            detector_backend=DETECTOR,
            distance_metric=METRIC,
            enforce_detection=False,  # 🔥 critical
        )

        distance = result.get("distance")

        if distance is None:
            return {
                "matched": False,
                "reason": "No face detected in input image",
            }

        matched = distance <= THRESHOLD

        return {
            "verified": matched,
            "user_id": user.user_id,
            "distance": distance,
            "threshold": THRESHOLD,
        }

    except Exception as e:
        # NEVER expose raw DeepFace errors to frontend
        raise HTTPException(
            status_code=400,
            detail="Face verification failed. Please ensure your face is clearly visible."
        )

    finally:
        if os.path.exists(input_path):
            os.remove(input_path)
