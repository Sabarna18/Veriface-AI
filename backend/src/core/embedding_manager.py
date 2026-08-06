from deepface import DeepFace

from core.config import settings

MODEL = settings.MODEL_NAME
DETECTOR = settings.DETECTOR_BACKEND


def generate_embedding(image_path: str):
    """
    Generate normalized face embedding metadata.

    Returns:
    {
        "embedding": [...],
        "embedding_version": "arcface_v1",
        "model_name": "ArcFace",
        "detector_backend": "opencv"
    }
    """
    print("Before represent")

    result = DeepFace.represent(
        img_path=image_path,
        model_name=MODEL,
        detector_backend=DETECTOR,
        enforce_detection=False,
    )

    print("After represent")

    if not result:
        return None

    # DeepFace returns list[dict]
    embedding_data = result[0]

    embedding = embedding_data.get("embedding")

    if embedding is None:
        return None

    return {
        "embedding": embedding,
        "embedding_version": settings.EMBEDDING_VERSION,
        "model_name": MODEL,
        "detector_backend": DETECTOR,
    }
