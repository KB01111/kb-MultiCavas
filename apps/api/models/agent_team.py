import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    system_prompt = Column(Text)
    config = Column(JSON)  # For model, tools, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to teams (many-to-many)
    teams = relationship("Team", secondary="team_agents", back_populates="agents")
    # Relationship to messages (one-to-many)
    messages = relationship("Message", back_populates="agent")
    # Relationship to agent states (one-to-many)
    states = relationship("AgentState", back_populates="agent")

class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    config = Column(JSON) # For team-specific settings, orchestration graph?
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to agents (many-to-many)
    agents = relationship("Agent", secondary="team_agents", back_populates="teams")
    # Relationship to conversations (one-to-many)
    conversations = relationship("Conversation", back_populates="team")

# Association table for Team and Agent (many-to-many)
class TeamAgent(Base):
    __tablename__ = "team_agents"

    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), primary_key=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), primary_key=True)
    role = Column(String) # Role of the agent within the team
    created_at = Column(DateTime(timezone=True), server_default=func.now())

