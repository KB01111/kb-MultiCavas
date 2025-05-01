import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    evaluator_id = Column(String) # Identifier for the evaluator (could be user or another agent)
    metrics = Column(JSON, nullable=False) # e.g., {"accuracy": 0.8, "fluency": 0.9, "task_completion": true}
    score = Column(Float) # Overall score if applicable
    feedback = Column(Text) # Qualitative feedback
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to conversation
    conversation = relationship("Conversation") # No back_populates needed if not navigating from Conversation to EvaluationResult

