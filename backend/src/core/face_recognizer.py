# backend/src/core/face_recognizer.py

from deepface import DeepFace
from core.config import settings


class FaceRecognizer:
    def verify(self, img1_path, img2_path):
        result = DeepFace.verify(
            img1_path=img1_path,
            img2_path=img2_path,
            model_name=settings.MODEL_NAME,
            detector_backend=settings.DETECTOR_BACKEND,
            distance_metric=settings.DISTANCE_METRIC,
            enforce_detection=False
        )
        return result

    def get_embedding(self, img_path):
        embedding = DeepFace.represent(
            img_path=img_path,
            model_name=settings.MODEL_NAME,
            detector_backend=settings.DETECTOR_BACKEND,
            enforce_detection=False
        )
        return embedding[0]["embedding"]
