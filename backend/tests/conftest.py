import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server import app
from db.database import Base, get_db

# ------------------------
# Test Database Setup
# ------------------------

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ------------------------
# DB fixture (isolated per test)
# ------------------------

@pytest.fixture(scope="function")
def db():
    connection = engine.connect()
    transaction = connection.begin()

    Base.metadata.create_all(bind=connection)

    session = TestingSessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


# ------------------------
# Client fixture
# ------------------------

@pytest.fixture(scope="function")
def client(db):
    """
    FastAPI TestClient with overridden DB dependency
    """

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
