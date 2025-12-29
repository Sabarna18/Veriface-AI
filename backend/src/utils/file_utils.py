# backend/src/utils/file_utils.py

from pathlib import Path
from datetime import datetime


ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def ensure_directory(path: Path):
    """
    Ensure a directory exists.
    """
    path.mkdir(parents=True, exist_ok=True)


def allowed_image_file(filename: str) -> bool:
    """
    Validate image file extension.
    """
    return Path(filename).suffix.lower() in ALLOWED_IMAGE_EXTENSIONS


def generate_filename(prefix: str, extension: str = ".jpg") -> str:
    """
    Generate timestamp-based filename.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{prefix}_{timestamp}{extension}"
