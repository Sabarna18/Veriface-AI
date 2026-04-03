from deepface import DeepFace

MODEL = "ArcFace"
DETECTOR = "opencv"

def generate_embedding(image_path: str):
    result = DeepFace.represent(
        img_path=image_path,
        model_name=MODEL,
        detector_backend=DETECTOR,
        enforce_detection=False,
    )

    if not result:
        return None

    return result