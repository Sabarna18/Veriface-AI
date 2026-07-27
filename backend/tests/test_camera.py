# backend/tests/test_camera.py

# -------------------- IMPORTS --------------------

import sys
from pathlib import Path

import pytest

from core.camera import Camera

# -------------------- PATH FIX --------------------


BASE_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = BASE_DIR / "src"
sys.path.append(str(SRC_DIR))


@pytest.mark.skip(reason="Requires physical camera")
def test_camera_capture():
    """
    Test whether camera can capture a frame.
    """
    camera = Camera()
    frame = camera.read_frame()

    assert frame is not None
    assert frame.size > 0

    camera.release()
