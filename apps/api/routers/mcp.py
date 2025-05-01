# apps/api/routers/mcp.py
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal
import uuid

from ..dependencies import get_db # Assuming dependency for DB session
from ..services import graph_service
from langgraph.graph.message import HumanMessage, AIMessage # Import message types

# --- MCP Schemas (Simplified based on common patterns) ---
# These should ideally align with the official MCP spec if available,
# or be based on the fastapi-mcp-langgraph-template structure.

class MCPMessage(BaseModel):
    role: Literal["user", "assistant", "system", "tool"]
    content: str
    # Add other potential fields like name (for tool), tool_call_id, tool_calls
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None

class MCPToolResult(BaseModel):
    tool_call_id: str
    content: str

class MCPRequest(BaseModel):
    conversation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    messages: List[MCPMessage]
    # Add other context fields if needed (e.g., user_id, specific agent_id)
    user_id: Optional[str] = None
    # Could add fields for specific model parameters, tools to use, etc.

class MCPResponse(BaseModel):
    conversation_id: str
    message: MCPMessage # The assistant's response message
    # Add other fields like usage statistics if applicable

# --- Router Definition ---
router = APIRouter(
    prefix="/mcp",
    tags=["MCP"],
)

# --- MCP Endpoint ---
@router.post("/invoke", response_model=MCPResponse)
async def invoke_agent_system(
    request: MCPRequest,
    db: Session = Depends(get_db)
):
    """Handles an incoming request according to the Model Context Protocol.

    Receives conversation history and context, invokes the agent graph,
    and returns the assistant's response in MCP format.
    """
    print(f"--- Received MCP Invoke Request for Conv {request.conversation_id} ---")
    # print(f"Request Body: {request.dict()}")

    # 1. Validate and Extract Input
    # Find the last user message to use as input for the graph service
    last_user_mcp_message = next((msg for msg in reversed(request.messages) if msg.role == "user"), None)

    if not last_user_mcp_message:
        raise HTTPException(status_code=400, detail="No user message found in the request")

    # Convert the last user message to the format expected by graph_service
    # Note: graph_service currently expects the *entire* history to be loaded from DB,
    # and the new message passed separately. We might need to adjust graph_service
    # or just pass the new message here.
    # For now, let's assume graph_service handles loading history based on conversation_id.
    input_graph_message = HumanMessage(content=last_user_mcp_message.content)

    # 2. Call the Graph Service
    try:
        # The graph_service loads history, appends input_graph_message, runs graph, saves results
        final_agent_message = await graph_service.run_graph_for_conversation(
            conversation_id=request.conversation_id,
            input_message=input_graph_message,
            db=db
        )
    except Exception as e:
        print(f"Error running graph service: {e}")
        # Consider more specific error handling based on graph_service exceptions
        raise HTTPException(status_code=500, detail=f"Internal server error during agent processing: {e}")

    # 3. Format the Response
    if not final_agent_message or not isinstance(final_agent_message, AIMessage):
        # Handle cases where the graph didn't produce a final AI message (e.g., error, ended unexpectedly)
        # For now, return a generic error or an empty response? Let's raise an error.
        print("--- Graph did not return a final AIMessage ---")
        raise HTTPException(status_code=500, detail="Agent system did not produce a final response.")

    response_mcp_message = MCPMessage(
        role="assistant",
        content=str(final_agent_message.content),
        # TODO: Map tool_calls from AIMessage to MCPMessage if they exist
        # tool_calls=final_agent_message.tool_calls if hasattr(final_agent_message, "tool_calls") else None
    )

    mcp_response = MCPResponse(
        conversation_id=request.conversation_id,
        message=response_mcp_message
    )

    print(f"--- Sending MCP Invoke Response for Conv {request.conversation_id} ---")
    return mcp_response

# TODO: Add other potential MCP endpoints if needed (e.g., for streaming, context management)

