# apps/api/tests/test_agent_states.py
import pytest
from fastapi.testclient import TestClient

# Assuming your client fixture is defined in conftest.py

@pytest.mark.asyncio
async def test_create_agent_state(client: TestClient):
    """Test creating a new agent state for a conversation."""
    # First, create a conversation
    conversation_data = {"name": "Agent State Test Conversation"}
    conv_response = client.post("/api/v1/conversations/", json=conversation_data)
    assert conv_response.status_code == 200
    conversation_id = conv_response.json()["id"]

    # Then, create an agent state for that conversation
    agent_state_data = {
        "conversation_id": conversation_id,
        "state_data": {"turn": 1, "status": "thinking"},
        "metadata": {"agent_id": "agent_123"}
    }
    response = client.post("/api/v1/agent-states/", json=agent_state_data)
    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == conversation_id
    assert data["state_data"] == agent_state_data["state_data"]
    assert data["metadata"] == agent_state_data["metadata"]
    assert "id" in data
    assert "created_at" in data

@pytest.mark.asyncio
async def test_read_agent_states_for_conversation(client: TestClient):
    """Test reading agent states for a specific conversation."""
    # Create a conversation
    conversation_data = {"name": "Read Agent States Test Conversation"}
    conv_response = client.post("/api/v1/conversations/", json=conversation_data)
    assert conv_response.status_code == 200
    conversation_id = conv_response.json()["id"]

    # Create an agent state in that conversation
    agent_state_data = {
        "conversation_id": conversation_id,
        "state_data": {"turn": 2, "status": "responding"}
    }
    state_response = client.post("/api/v1/agent-states/", json=agent_state_data)
    assert state_response.status_code == 200
    state_id = state_response.json()["id"]

    # Read agent states for the conversation
    response = client.get(f"/api/v1/conversations/{conversation_id}/agent-states/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(state["id"] == state_id and state["state_data"] == agent_state_data["state_data"] for state in data)

