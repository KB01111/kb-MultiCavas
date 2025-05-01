# apps/api/tests/test_conversations.py
import pytest
from fastapi.testclient import TestClient

# Assuming your client fixture is defined in conftest.py

@pytest.mark.asyncio
async def test_create_conversation(client: TestClient):
    """Test creating a new conversation via the API."""
    conversation_data = {
        "name": "Test Conversation",
        "metadata": {"topic": "testing"}
    }
    response = client.post("/api/v1/conversations/", json=conversation_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == conversation_data["name"]
    assert data["metadata"] == conversation_data["metadata"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

@pytest.mark.asyncio
async def test_read_conversations(client: TestClient):
    """Test reading a list of conversations."""
    # First, create a conversation to ensure the list is not empty
    conversation_data = {
        "name": "List Test Conversation",
        "metadata": {"purpose": "list test"}
    }
    client.post("/api/v1/conversations/", json=conversation_data)

    response = client.get("/api/v1/conversations/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Check if at least one conversation (the one we created) is in the list
    assert len(data) > 0
    assert any(conv["name"] == conversation_data["name"] for conv in data)

