from db.models import User, UserRole


def test_student_can_mark_attendance(client, db):
    user = User(
        user_id="STU1",
        classroom_id="C1",
        role=UserRole.USER,
    )
    db.add(user)
    db.commit()

    res = client.post(
        "/attendance/mark/STU1",
        params={"classroom_id": "C1"},
    )

    assert res.status_code == 200
    assert res.json()["message"] == "Attendance marked successfully"


def test_duplicate_attendance_blocked(client, db):
    user = User(
        user_id="STU1",
        classroom_id="C1",
        role=UserRole.USER,
    )
    db.add(user)
    db.commit()

    client.post("/attendance/mark/STU1", params={"classroom_id": "C1"})
    res = client.post("/attendance/mark/STU1", params={"classroom_id": "C1"})

    assert "already marked" in res.json()["message"]
