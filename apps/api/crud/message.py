from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid

from .. import models, schemas

def get_message(db: Session, message_id: uuid.UUID):
    return db.get(models.Message, message_id)

def get_messages_by_conversation(db: Session, conversation_id: uuid.UUID, skip: int = 0, limit: int = 1000):
    result = db.execute(
        select(models.Message)
        .where(models.Message.conversation_id == conversation_id)
        .order_by(models.Message.created_at) # Ensure messages are ordered chronologically
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

def create_message(db: Session, message: schemas.MessageCreate):
    db_message = models.Message(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

# Update/Delete for messages might be less common, depending on use case
# def delete_message(db: Session, message_id: uuid.UUID): ...

