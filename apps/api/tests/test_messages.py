# apps/api/tests/test_messages.py
import pytest
from fastapi.testclient import TestClient

# Assuming your client fixture is defined in conftest.py

@pytest.mark.asyncio
async def test_create_message(client: TestClient):
    """Test creating a new message within a conversation."""
    # First, create a conversation
    conversation_data = {"name": "Message Test Conversation"}
    conv_response = client.post("/api/v1/conversations/", json=conversation_data)
    assert conv_response.status_code == 200
    conversation_id = conv_response.json()["id"]

    # Then, create a message in that conversation
    message_data = {
        "conversation_id": conversation_id,
        "content": "Hello, this is a test message.",
        "sender_type": "user",
        "metadata": {"timestamp": "2025-04-30T22:54:00Z"}
    }
    response = client.post("/api/v1/messages/", json=message_data)
    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == conversation_id
    assert data["content"] == message_data["content"]
    assert data["sender_type"] == message_data["sender_type"]
    assert data["metadata"] == message_data["metadata"]
    assert "id" in data
    assert "created_at" in data

@pytest.mark.asyncio
async def test_read_messages_for_conversation(client: TestClient):
    """Test reading messages for a specific conversation."""
    # Create a conversation
    conversation_data = {"name": "Read Messages Test Conversation"}
    conv_response = client.post("/api/v1/conversations/", json=conversation_data)
    assert conv_response.status_code == 200
    conversation_id = conv_response.json()["id"]

    # Create a message in that conversation
    message_data = {
        "conversation_id": conversation_id,
        "content": "Message for reading test.",
        "sender_type": "assistant"
    }
    msg_response = client.post("/api/v1/messages/", json=message_data)
    assert msg_response.status_code == 200
    message_id = msg_response.json()["id"]

    # Read messages for the conversation
    response = client.get(f"/api/v1/conversations/{conversation_id}/messages/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(msg["id"] == message_id and msg["content"] == message_data["content"] for msg in data)

