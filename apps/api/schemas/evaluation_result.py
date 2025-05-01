from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

# Base schema for common fields
class EvaluationResultBase(BaseModel):
    conversation_id: uuid.UUID
    evaluator_id: Optional[str] = None # Identifier for the evaluator
    metrics: Dict[str, Any] = Field(..., description="Evaluation metrics, e.g., {\"accuracy\": 0.8}")
    score: Optional[float] = None
    feedback: Optional[str] = None

# Schema for creating an evaluation result (request body)
class EvaluationResultCreate(EvaluationResultBase):
    pass

# Schema for evaluation result response (includes ID and timestamps)
class EvaluationResultResponse(EvaluationResultBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

