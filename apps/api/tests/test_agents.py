# apps/api/tests/test_agents.py
import pytest
from fastapi.testclient import TestClient

# Assuming your client fixture is defined in conftest.py

@pytest.mark.asyncio
async def test_create_agent(client: TestClient):
    """Test creating a new agent via the API."""
    agent_data = {
        "name": "Test Agent",
        "description": "An agent created for testing purposes",
        "system_prompt": "You are a helpful test agent.",
        "config": {"model": "gpt-4o"}
    }
    response = client.post("/api/v1/agents/", json=agent_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == agent_data["name"]
    assert data["description"] == agent_data["description"]
    assert "id" in data

@pytest.mark.asyncio
async def test_read_agents(client: TestClient):
    """Test reading a list of agents."""
    # First, create an agent to ensure the list is not empty
    agent_data = {
        "name": "List Test Agent",
        "description": "Another agent for testing list endpoint",
        "system_prompt": "You list things.",
        "config": {"model": "gpt-3.5-turbo"}
    }
    client.post("/api/v1/agents/", json=agent_data)

    response = client.get("/api/v1/agents/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Check if at least one agent (the one we created) is in the list
    assert len(data) > 0
    assert any(agent["name"] == agent_data["name"] for agent in data)

