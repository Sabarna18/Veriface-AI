from db.models import User, UserRole
from core.security import get_password_hash


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
        "/auth/login",
        json={"user_id": "ADMIN1", "password": "secret"},
    )
    return res.json()["access_token"]


def test_register_user_requires_admin(client, db):
    res = client.post("/register/")
    assert res.status_code in (401, 403)


def test_admin_can_register_user(client, db, tmp_path):
    token = get_admin_token(client, db)

    image = tmp_path / "face.jpg"
    image.write_bytes(b"fake-image")

    res = client.post(
        "/register/",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("face.jpg", image.read_bytes())},
        data={"user_id": "STU1", "classroom_id": "C1"},
    )

    assert res.status_code == 200
    assert res.json()["user_id"] == "STU1"
