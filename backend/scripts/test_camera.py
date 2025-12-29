# backend/scripts/test_camera.py

import sys
from pathlib import Path

# -------------------- PATH FIX --------------------
BASE_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = BASE_DIR / "src"
sys.path.append(str(SRC_DIR))

# -------------------- IMPORTS --------------------
import cv2
from core.camera import Camera


def main():
    try:
        camera = Camera()
        print("✅ Camera opened successfully")
    except Exception as e:
        print(f"❌ Camera error: {e}")
        return

    print("📸 Press 'q' to exit")

    while True:
        frame = camera.read_frame()
        cv2.imshow("Camera Test", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    camera.release()
    cv2.destroyAllWindows()
    print("👋 Camera released cleanly")


if __name__ == "__main__":
    main()
