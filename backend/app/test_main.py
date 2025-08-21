import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app, get_db
from app.database import Base
import os

# Use a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    # Create test database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop test database tables after tests
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_register_success():
    response = client.post(
        "/users/",
        json={
            "email": "testuser1@gmail.com",
            "password": "Test1234",
            "re_password": "Test1234"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser1@gmail.com"
    assert "id" in data
    assert "role" in data

def test_register_password_mismatch():
    response = client.post(
        "/users/",
        json={
            "email": "testuser2@gmail.com",
            "password": "Test1234",
            "re_password": "Test5678"
        }
    )
    assert response.status_code == 400
    assert "Passwords do not match" in response.json()["detail"]

def test_register_invalid_email():
    response = client.post(
        "/users/",
        json={
            "email": "notgmail@yahoo.com",
            "password": "Test1234",
            "re_password": "Test1234"
        }
    )
    assert response.status_code == 400
    assert "Only Gmail addresses are allowed" in response.json()["detail"]

def test_register_weak_password():
    response = client.post(
        "/users/",
        json={
            "email": "testuser3@gmail.com",
            "password": "short",
            "re_password": "short"
        }
    )
    assert response.status_code == 400
    assert "Password must be at least 8 characters" in response.json()["detail"]

def test_register_existing_email():
    # First registration
    response = client.post(
        "/users/",
        json={
            "email": "testuser4@gmail.com",
            "password": "Test1234",
            "re_password": "Test1234"
        }
    )
    assert response.status_code == 200

    # Try to register with the same email
    response = client.post(
        "/users/",
        json={
            "email": "testuser4@gmail.com",
            "password": "AnotherTest1234",
            "re_password": "AnotherTest1234"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]
