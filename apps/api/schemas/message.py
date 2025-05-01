from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime

# Base schema for common fields
class MessageBase(BaseModel):
    conversation_id: uuid.UUID
    agent_id: Optional[uuid.UUID] = None
    role: str = Field(..., description="Role of the message sender (e.g., user, assistant, system, tool)")
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None # For assistant messages requesting tool use
    tool_call_id: Optional[str] = None # For tool messages responding to a specific call
    metadata: Optional[Dict[str, Any]] = None

# Schema for creating a message (request body)
class MessageCreate(MessageBase):
    pass

# Schema for message response (includes ID and timestamps)
class MessageResponse(MessageBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

