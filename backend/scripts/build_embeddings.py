# backend/scripts/build_embeddings.py

import sys
from pathlib import Path

# -------------------- PATH FIX --------------------
BASE_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = BASE_DIR / "src"
sys.path.append(str(SRC_DIR))

# -------------------- IMPORTS --------------------
from core.face_recognizer import FaceRecognizer
from core.embedding_manager import EmbeddingManager
from core.config import settings


def main():
    recognizer = FaceRecognizer()
    embedding_manager = EmbeddingManager()

    registrations_dir = settings.RAW_FACES_DIR

    if not registrations_dir.exists():
        print("❌ No registrations directory found")
        return

    processed = 0

    for user_dir in registrations_dir.iterdir():
        if not user_dir.is_dir():
            continue

        user_id = user_dir.name
        images = sorted(user_dir.glob("*.jpg"))

        if not images:
            print(f"⚠️ No images found for {user_id}")
            continue

        image_path = images[-1]  # latest image

        try:
            embedding = recognizer.get_embedding(str(image_path))
            embedding_manager.add_embedding(user_id, embedding)
            processed += 1
            print(f"✅ Embedding rebuilt for {user_id}")
        except Exception as e:
            print(f"❌ Failed for {user_id}: {e}")

    print(f"\n🎯 Total users processed: {processed}")


if __name__ == "__main__":
    main()
