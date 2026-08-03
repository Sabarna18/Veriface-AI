import tempfile
from pathlib import Path

import cv2
import numpy as np
from deepface import DeepFace


def main() -> None:
    image = np.zeros((112, 112, 3), dtype=np.uint8)

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp:
        path = Path(temp.name)

    cv2.imwrite(str(path), image)

    try:
        DeepFace.represent(
            img_path=str(path),
            model_name="ArcFace",
            detector_backend="skip",
        )
    except Exception:
        # We only want the model weights downloaded.
        pass
    finally:
        path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
