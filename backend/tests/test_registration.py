from core.security import get_password_hash
from db.models import User, UserRole


def get_admin_token(client, db):
    admin = User(
        user_id="ADMIN1",
        classroom_id="C1",
        role=UserRole.ADMIN,
        hashed_password=get_password_hash("secret"),
    )

    db.add(admin)
    db.commit()

    response = client.post(
        "/auth/login/",
        data={
            "username": "ADMIN1",
            "password": "secret",
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


# ==========================================================
# AUTHORIZATION
# ==========================================================


def test_register_user_requires_admin(client):
    response = client.post("/register/")

    assert response.status_code in (401, 403)


# ==========================================================
# SUCCESSFUL REGISTRATION
# ==========================================================


def test_admin_can_register_user(
    client,
    db,
    tmp_path,
    monkeypatch,
):
    token = get_admin_token(client, db)

    # ------------------------------------------------------
    # Mock embedding generation
    # ------------------------------------------------------

    def mock_generate_embedding(_):
        return {
            "embedding": [0.1, 0.2, 0.3],
            "model": "ArcFace",
            "version": "test",
        }

    monkeypatch.setattr(
        "api.registration.generate_embedding",
        mock_generate_embedding,
    )

    # ------------------------------------------------------
    # Mock Supabase Storage
    # ------------------------------------------------------

    uploaded_storage_key = "C1/STU1/test-face.jpg"

    def mock_upload_face(*args, **kwargs):
        return uploaded_storage_key

    def mock_download_face(storage_key):
        assert storage_key == uploaded_storage_key
        return b"fake-image"

    def mock_delete_face(storage_key):
        return None

    monkeypatch.setattr(
        "api.registration.storage.upload_face",
        mock_upload_face,
    )

    monkeypatch.setattr(
        "api.registration.storage.download_face",
        mock_download_face,
    )

    monkeypatch.setattr(
        "api.registration.storage.delete_face",
        mock_delete_face,
    )

    # ------------------------------------------------------
    # Fake image
    # ------------------------------------------------------

    image = tmp_path / "face.jpg"

    image.write_bytes(b"fake-image")

    # ------------------------------------------------------
    # Request
    # ------------------------------------------------------

    response = client.post(
        "/register/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        files={
            "image": (
                "face.jpg",
                image.read_bytes(),
                "image/jpeg",
            )
        },
        data={
            "user_id": "STU1",
            "classroom_id": "C1",
        },
    )

    if response.status_code != 200:
        print(response.text)

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "User registered successfully"
    assert data["user_id"] == "STU1"
    assert data["classroom_id"] == "C1"

    # ------------------------------------------------------
    # Verify database
    # ------------------------------------------------------

    user = db.query(User).filter(User.user_id == "STU1").first()

    assert user is not None

    assert user.face_image_key == uploaded_storage_key

    assert user.embedding_model == "ArcFace"

    assert user.embedding_version == "arcface_v1"

    assert user.role == UserRole.USER
