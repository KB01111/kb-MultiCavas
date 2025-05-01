# apps/api/tests/test_teams.py
import pytest
from fastapi.testclient import TestClient

# Assuming your client fixture is defined in conftest.py

@pytest.mark.asyncio
async def test_create_team(client: TestClient):
    """Test creating a new team via the API."""
    # First, create an agent to assign to the team
    agent_data = {
        "name": "Team Member Agent",
        "description": "An agent to be part of a team",
        "system_prompt": "You are a team player.",
        "config": {"model": "gpt-4"}
    }
    agent_response = client.post("/api/v1/agents/", json=agent_data)
    assert agent_response.status_code == 200
    agent_id = agent_response.json()["id"]

    team_data = {
        "name": "Test Team",
        "description": "A team created for testing purposes",
        "agent_ids": [agent_id]
    }
    response = client.post("/api/v1/teams/", json=team_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == team_data["name"]
    assert data["description"] == team_data["description"]
    assert "id" in data
    assert len(data["agents"]) == 1
    assert data["agents"][0]["id"] == agent_id

@pytest.mark.asyncio
async def test_read_teams(client: TestClient):
    """Test reading a list of teams."""
    # First, create a team to ensure the list is not empty
    agent_data = {
        "name": "Another Team Member Agent",
        "description": "Agent for list test",
        "system_prompt": "You list teams.",
        "config": {"model": "gpt-3.5"}
    }
    agent_response = client.post("/api/v1/agents/", json=agent_data)
    assert agent_response.status_code == 200
    agent_id = agent_response.json()["id"]

    team_data = {
        "name": "List Test Team",
        "description": "Team for list endpoint test",
        "agent_ids": [agent_id]
    }
    client.post("/api/v1/teams/", json=team_data)

    response = client.get("/api/v1/teams/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Check if at least one team (the one we created) is in the list
    assert len(data) > 0
    assert any(team["name"] == team_data["name"] for team in data)

