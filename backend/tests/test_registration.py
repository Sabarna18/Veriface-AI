# backend/tests/test_registration.py

import sys
from pathlib import Path
import shutil
import io

# -------------------- PATH FIX --------------------
BASE_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = BASE_DIR / "src"
sys.path.append(str(SRC_DIR))

# -------------------- IMPORTS --------------------
from fastapi.testclient import TestClient
from main import app
from core.config import settings
from core.embedding_manager import EmbeddingManager

client = TestClient(app)


TEST_USER_ID = "test_user_api"


def cleanup():
    """Ensure clean state before & after tests"""
    user_dir = settings.RAW_FACES_DIR / TEST_USER_ID
    if user_dir.exists():
        shutil.rmtree(user_dir)

    em = EmbeddingManager()
    embeddings = em.get_all()
    embeddings.pop(TEST_USER_ID, None)
    em.save_embeddings()


def setup_module(module):
    cleanup()


def teardown_module(module):
    cleanup()


def test_register_user():
    """
    Test registering a user via API.
    """
    image_path = BASE_DIR / "tests" / "sample_face.jpg"

    # If you don't have a sample image yet, create a dummy file
    if not image_path.exists():
        image_path.write_bytes(b"\x00\x00\x00")

    with open(image_path, "rb") as f:
        response = client.post(
            "/register",
            data={"user_id": TEST_USER_ID},
            files={"image": ("face.jpg", f, "image/jpeg")},
        )

    assert response.status_code == 200
    assert response.json()["user_id"] == TEST_USER_ID


def test_get_user():
    """
    Test fetching a registered user.
    """
    response = client.get(f"/register/{TEST_USER_ID}")

    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == TEST_USER_ID
    assert body["has_embedding"] is True
    assert body["num_images"] >= 1


def test_delete_user():
    """
    Test deleting a particular user.
    """
    response = client.delete(f"/register/{TEST_USER_ID}")

    assert response.status_code == 200
    assert response.json()["user_id"] == TEST_USER_ID

    # Ensure user is really gone
    response = client.get(f"/register/{TEST_USER_ID}")
    assert response.status_code == 404


def test_delete_all_users():
    """
    Test deleting all users.
    """
    response = client.delete("/register")
    assert response.status_code == 200
    assert "All users deleted" in response.json()["message"]
