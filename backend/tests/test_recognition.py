# backend/tests/test_recognition.py

import sys
from pathlib import Path
import shutil
import numpy as np

# -------------------- PATH FIX --------------------
BASE_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = BASE_DIR / "src"
sys.path.append(str(SRC_DIR))

# -------------------- IMPORTS --------------------
from core.face_recognizer import FaceRecognizer
from core.embedding_manager import EmbeddingManager
from core.config import settings


TEST_USER_ID = "test_recognition_user"


def setup_module(module):
    """
    Create a dummy embedding for testing.
    """
    em = EmbeddingManager()
    dummy_embedding = np.random.rand(512).tolist()
    em.add_embedding(TEST_USER_ID, dummy_embedding)


def teardown_module(module):
    """
    Cleanup test embedding.
    """
    em = EmbeddingManager()
    em.embeddings.pop(TEST_USER_ID, None)
    em.save_embeddings()


def test_embedding_manager_storage():
    """
    Test embedding exists and is valid.
    """
    em = EmbeddingManager()
    embeddings = em.get_all()

    assert TEST_USER_ID in embeddings
    assert len(embeddings[TEST_USER_ID]) == 512
