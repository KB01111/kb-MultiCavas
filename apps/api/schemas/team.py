from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime
from .agent import AgentResponse # Import AgentResponse for relationship

# Base schema for common fields
class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

# Schema for creating a team (request body)
class TeamCreate(TeamBase):
    pass

# Schema for updating a team (request body)
class TeamUpdate(TeamBase):
    name: Optional[str] = None # Allow partial updates

# Schema for team response (includes ID and timestamps)
class TeamResponse(TeamBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Optionally include related agents in the response
    # agents: List[AgentResponse] = [] # Be careful about circular dependencies if AgentResponse includes TeamResponse

    class Config:
        from_attributes = True

# Schema for adding/updating agent role in a team
class TeamAgentUpdate(BaseModel):
    agent_id: uuid.UUID
    role: Optional[str] = None

