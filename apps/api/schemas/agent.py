from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime

# Base schema for common fields
class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

# Schema for creating an agent (request body)
class AgentCreate(AgentBase):
    pass

# Schema for updating an agent (request body)
class AgentUpdate(AgentBase):
    name: Optional[str] = None # Allow partial updates

# Schema for agent response (includes ID and timestamps)
class AgentResponse(AgentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True # Use `orm_mode` replacement for Pydantic v2

