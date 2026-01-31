from db.models import User, UserRole
from core.security import get_password_hash


def test_admin_login_success(client, db):
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

    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "admin"


def test_student_cannot_login(client, db):
    student = User(
        user_id="STU1",
        classroom_id="C1",
        role=UserRole.USER,
    )
    db.add(student)
    db.commit()

    res = client.post(
        "/auth/login",
        json={"user_id": "STU1", "password": "any"},
    )

    assert res.status_code == 403
