from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid

from .. import models, schemas

def get_evaluation_result(db: Session, result_id: uuid.UUID):
    return db.get(models.EvaluationResult, result_id)

def get_evaluation_results_by_conversation(db: Session, conversation_id: uuid.UUID, skip: int = 0, limit: int = 100):
    result = db.execute(
        select(models.EvaluationResult)
        .where(models.EvaluationResult.conversation_id == conversation_id)
        .order_by(models.EvaluationResult.created_at.desc()) # Show newest first
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

def create_evaluation_result(db: Session, result: schemas.EvaluationResultCreate):
    db_result = models.EvaluationResult(**result.model_dump())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

# Update/Delete for evaluation results might be less common
# def delete_evaluation_result(db: Session, result_id: uuid.UUID): ...

