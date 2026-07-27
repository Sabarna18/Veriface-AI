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

    res = client.post(
        "/auth/login/",
        data={
            "username": "ADMIN1",
            "password": "secret",
        },
    )

    assert res.status_code == 200
    return res.json()["access_token"]


def test_register_user_requires_admin(client, db):
    res = client.post("/register/")
    assert res.status_code in (401, 403)


def test_admin_can_register_user(client, db, tmp_path, monkeypatch):
    token = get_admin_token(client, db)

    def mock_generate_embedding(image_path):
        return {
            "embedding": [0.1, 0.2, 0.3],
            "model": "ArcFace",
            "version": "test",
        }

    monkeypatch.setattr(
        "api.registration.generate_embedding",
        mock_generate_embedding,
    )

    image = tmp_path / "face.jpg"
    image.write_bytes(b"fake-image")

    res = client.post(
        "/register/",
        headers={"Authorization": f"Bearer {token}"},
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

    assert res.status_code == 200

    data = res.json()

    assert data["user_id"] == "STU1"
    assert data["classroom_id"] == "C1"
    assert data["message"] == "User registered successfully"
