# apps/api/tests/test_evaluation_results.py
import pytest
from fastapi.testclient import TestClient

# Assuming your client fixture is defined in conftest.py

@pytest.mark.asyncio
async def test_create_evaluation_result(client: TestClient):
    """Test creating a new evaluation result for a message."""
    # First, create a conversation and a message
    conversation_data = {"name": "Eval Test Conversation"}
    conv_response = client.post("/api/v1/conversations/", json=conversation_data)
    assert conv_response.status_code == 200
    conversation_id = conv_response.json()["id"]

    message_data = {
        "conversation_id": conversation_id,
        "content": "Message to be evaluated.",
        "sender_type": "assistant"
    }
    msg_response = client.post("/api/v1/messages/", json=message_data)
    assert msg_response.status_code == 200
    message_id = msg_response.json()["id"]

    # Then, create an evaluation result for that message
    evaluation_data = {
        "message_id": message_id,
        "evaluator": "test_evaluator",
        "score": 0.85,
        "feedback": "Looks good, but could be more concise.",
        "metadata": {"run_id": "eval_run_1"}
    }
    response = client.post("/api/v1/evaluation-results/", json=evaluation_data)
    assert response.status_code == 200
    data = response.json()
    assert data["message_id"] == message_id
    assert data["evaluator"] == evaluation_data["evaluator"]
    assert data["score"] == evaluation_data["score"]
    assert data["feedback"] == evaluation_data["feedback"]
    assert data["metadata"] == evaluation_data["metadata"]
    assert "id" in data
    assert "created_at" in data

@pytest.mark.asyncio
async def test_read_evaluation_results_for_message(client: TestClient):
    """Test reading evaluation results for a specific message."""
    # Create a conversation and a message
    conversation_data = {"name": "Read Eval Test Conversation"}
    conv_response = client.post("/api/v1/conversations/", json=conversation_data)
    assert conv_response.status_code == 200
    conversation_id = conv_response.json()["id"]

    message_data = {
        "conversation_id": conversation_id,
        "content": "Another message to be evaluated.",
        "sender_type": "user"
    }
    msg_response = client.post("/api/v1/messages/", json=message_data)
    assert msg_response.status_code == 200
    message_id = msg_response.json()["id"]

    # Create an evaluation result for that message
    evaluation_data = {
        "message_id": message_id,
        "evaluator": "read_test_evaluator",
        "score": 0.95,
        "feedback": "Excellent!"
    }
    eval_response = client.post("/api/v1/evaluation-results/", json=evaluation_data)
    assert eval_response.status_code == 200
    eval_id = eval_response.json()["id"]

    # Read evaluation results for the message
    response = client.get(f"/api/v1/messages/{message_id}/evaluation-results/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(eval_res["id"] == eval_id and eval_res["score"] == evaluation_data["score"] for eval_res in data)

