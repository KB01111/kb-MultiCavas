import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class AgentState(Base):
    __tablename__ = "agent_states"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    state_data = Column(JSON, nullable=False) # Stores the actual state (e.g., LangGraph state dict)
    version = Column(String) # Optional versioning for the state structure
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to conversation
    conversation = relationship("Conversation", back_populates="agent_states")
    # Relationship to agent
    agent = relationship("Agent", back_populates="states")

