from sqlalchemy.orm import Session
from sqlalchemy import select, delete
import uuid

from .. import models, schemas

def get_conversation(db: Session, conversation_id: uuid.UUID):
    return db.get(models.Conversation, conversation_id)

def get_conversations(db: Session, user_id: str = None, team_id: uuid.UUID = None, skip: int = 0, limit: int = 100):
    query = select(models.Conversation)
    if user_id:
        query = query.where(models.Conversation.user_id == user_id)
    if team_id:
        query = query.where(models.Conversation.team_id == team_id)
    result = db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

def create_conversation(db: Session, conversation: schemas.ConversationCreate):
    db_conversation = models.Conversation(**conversation.model_dump())
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

def update_conversation(db: Session, conversation_id: uuid.UUID, conversation_update: schemas.ConversationUpdate):
    db_conversation = get_conversation(db, conversation_id)
    if not db_conversation:
        return None
    update_data = conversation_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_conversation, key, value)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

def delete_conversation(db: Session, conversation_id: uuid.UUID):
    db_conversation = get_conversation(db, conversation_id)
    if not db_conversation:
        return None
    # Need to handle related messages, states, evaluations if necessary (cascade?)
    # For now, just deleting the conversation.
    db.delete(db_conversation)
    db.commit()
    return db_conversation

