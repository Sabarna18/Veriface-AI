# backend/src/core/attendance_manager.py

import pandas as pd
from datetime import datetime
from core.config import settings


class AttendanceManager:
    def __init__(self):
        self.file = settings.ATTENDANCE_FILE

        # Ensure file exists WITH headers
        if not self.file.exists() or self.file.stat().st_size == 0:
            df = pd.DataFrame(columns=["user_id", "date", "time"])
            df.to_csv(self.file, index=False)

    def _load_df(self) -> pd.DataFrame:
        """
        Safely load attendance CSV.
        """
        try:
            return pd.read_csv(self.file)
        except pd.errors.EmptyDataError:
            return pd.DataFrame(columns=["user_id", "date", "time"])

    def mark_attendance(self, user_id: str):
        today = datetime.now().strftime("%Y-%m-%d")
        now = datetime.now().strftime("%H:%M:%S")

        df = self._load_df()

        if ((df["user_id"] == user_id) & (df["date"] == today)).any():
            return False

        df.loc[len(df)] = [user_id, today, now]
        df.to_csv(self.file, index=False)
        return True

    def get_today_attendance(self):
        today = datetime.now().strftime("%Y-%m-%d")
        df = self._load_df()
        return df[df["date"] == today].to_dict(orient="records")
