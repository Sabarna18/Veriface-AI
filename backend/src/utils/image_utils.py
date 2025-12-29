# backend/src/utils/image_utils.py

import cv2
import uuid
from pathlib import Path


def resize_image(image, width: int = 224, height: int = 224):
    """
    Resize image to a fixed size.
    """
    return cv2.resize(image, (width, height))


def crop_face(image, x: int, y: int, w: int, h: int):
    """
    Crop face region from image.
    """
    return image[y:y + h, x:x + w]


def save_image(image, directory: Path, prefix: str = "img"):
    """
    Save image with a unique filename.
    """
    directory.mkdir(parents=True, exist_ok=True)
    filename = f"{prefix}_{uuid.uuid4().hex}.jpg"
    path = directory / filename
    cv2.imwrite(str(path), image)
    return path
