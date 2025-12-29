# backend/src/core/embedding_manager.py

import pickle
import numpy as np
from core.config import settings


class EmbeddingManager:
    def __init__(self):
        self.embeddings = self.load_embeddings()

    def load_embeddings(self):
        if settings.EMBEDDINGS_FILE.exists():
            with open(settings.EMBEDDINGS_FILE, "rb") as f:
                return pickle.load(f)
        return {}

    def save_embeddings(self):
        with open(settings.EMBEDDINGS_FILE, "wb") as f:
            pickle.dump(self.embeddings, f)

    def add_embedding(self, user_id: str, embedding: list):
        self.embeddings[user_id] = np.array(embedding)
        self.save_embeddings()

    def get_all(self):
        return self.embeddings
