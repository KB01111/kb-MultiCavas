from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime
from .message import MessageResponse # Import for relationship

# Base schema for common fields
class ConversationBase(BaseModel):
    user_id: Optional[str] = None
    team_id: Optional[uuid.UUID] = None
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Schema for creating a conversation (request body)
class ConversationCreate(ConversationBase):
    pass

# Schema for updating a conversation (request body)
class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Schema for conversation response (includes ID and timestamps)
class ConversationResponse(ConversationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Optionally include related messages in the response
    # messages: List[MessageResponse] = [] # Be careful about performance with many messages

    class Config:
        from_attributes = True

