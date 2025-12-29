# backend/scripts/register_face.py

import sys
from pathlib import Path

# -------------------- PATH FIX --------------------
BASE_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = BASE_DIR / "src"
sys.path.append(str(SRC_DIR))

# -------------------- IMPORTS --------------------
import cv2

from core.camera import Camera
from core.face_recognizer import FaceRecognizer
from core.embedding_manager import EmbeddingManager
from core.config import settings
from utils.image_utils import save_image


def main():
    user_id = input("Enter user ID: ").strip()
    if not user_id:
        print("❌ User ID cannot be empty")
        return

    camera = Camera()
    recognizer = FaceRecognizer()
    embedding_manager = EmbeddingManager()

    print("📸 Press 's' to capture | 'q' to quit")

    while True:
        frame = camera.read_frame()
        cv2.imshow("Register Face", frame)

        key = cv2.waitKey(1) & 0xFF

        if key == ord("s"):
            user_dir = settings.RAW_FACES_DIR / user_id
            image_path = save_image(frame, user_dir, prefix="register")

            embedding = recognizer.get_embedding(str(image_path))
            embedding_manager.add_embedding(user_id, embedding)

            print(f"✅ User '{user_id}' registered successfully")
            break

        elif key == ord("q"):
            print("❌ Registration cancelled")
            break

    camera.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
