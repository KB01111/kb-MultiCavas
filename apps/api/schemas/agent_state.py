from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

# Base schema for common fields
class AgentStateBase(BaseModel):
    conversation_id: uuid.UUID
    agent_id: uuid.UUID
    state_data: Dict[str, Any] = Field(..., description="The actual state data, e.g., LangGraph state")
    version: Optional[str] = None

# Schema for creating/updating an agent state (request body)
# Typically state is managed internally, but might need an endpoint for specific cases
class AgentStateCreateOrUpdate(AgentStateBase):
    pass

# Schema for agent state response (includes ID and timestamps)
class AgentStateResponse(AgentStateBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

