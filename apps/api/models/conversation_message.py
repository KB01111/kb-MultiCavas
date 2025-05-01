import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True) # Optional link to a team
    user_id = Column(String) # Identifier for the end-user
    title = Column(String)
    metadata = Column(JSON) # Any extra info about the conversation
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to team
    team = relationship("Team", back_populates="conversations")
    # Relationship to messages (one-to-many)
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")
    # Relationship to agent states (one-to-many)
    agent_states = relationship("AgentState", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True) # Link message to specific agent if applicable
    role = Column(String, nullable=False) # e.g., "user", "assistant", "system", "tool"
    content = Column(Text, nullable=False)
    tool_calls = Column(JSON) # If role is "tool", store tool call info
    tool_call_id = Column(String) # If role is response to tool call
    metadata = Column(JSON) # Any extra info about the message
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to conversation
    conversation = relationship("Conversation", back_populates="messages")
    # Relationship to agent
    agent = relationship("Agent", back_populates="messages")

