# apps/api/tests/conftest.py
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Assuming your main FastAPI app instance is in apps/api/main.py
# Adjust the import path if necessary
from ..main import app, get_db
from ..models.base import Base # Import Base for creating tables

# Use an in-memory SQLite database for testing
DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}, # Needed for SQLite
    poolclass=StaticPool, # Use StaticPool for SQLite in-memory
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables in the in-memory database before tests run
Base.metadata.create_all(bind=engine)

def override_get_db() -> Generator:
    """Override dependency to use the in-memory test database."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Apply the dependency override for the test session
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client() -> Generator:
    """Pytest fixture to provide a FastAPI TestClient."""
    with TestClient(app) as c:
        yield c

