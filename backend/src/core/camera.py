# backend/src/core/camera.py

import cv2
from core.config import settings


class Camera:
    def __init__(self, source: int | str = settings.CAMERA_INDEX):
        self.source = source
        self.cap = cv2.VideoCapture(self.source)

        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, settings.FRAME_WIDTH)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, settings.FRAME_HEIGHT)

        if not self.cap.isOpened():
            raise RuntimeError("❌ Unable to access camera")

    def read_frame(self):
        success, frame = self.cap.read()
        if not success:
            raise RuntimeError("❌ Failed to capture frame")
        return frame

    def release(self):
        self.cap.release()
