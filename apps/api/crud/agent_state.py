from sqlalchemy.orm import Session
from sqlalchemy import select, delete
import uuid

from .. import models, schemas

def get_agent_state(db: Session, state_id: uuid.UUID):
    return db.get(models.AgentState, state_id)

def get_agent_states_by_conversation(db: Session, conversation_id: uuid.UUID, agent_id: uuid.UUID = None, skip: int = 0, limit: int = 100):
    query = select(models.AgentState).where(models.AgentState.conversation_id == conversation_id)
    if agent_id:
        query = query.where(models.AgentState.agent_id == agent_id)
    result = db.execute(query.order_by(models.AgentState.updated_at.desc()).offset(skip).limit(limit))
    return result.scalars().all()

def create_or_update_agent_state(db: Session, state: schemas.AgentStateCreateOrUpdate):
    # Check if state already exists for this agent in this conversation
    existing_state = db.execute(
        select(models.AgentState)
        .where(models.AgentState.conversation_id == state.conversation_id)
        .where(models.AgentState.agent_id == state.agent_id)
    ).scalar_one_or_none()

    if existing_state:
        # Update existing state
        update_data = state.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing_state, key, value)
        db_state = existing_state
    else:
        # Create new state
        db_state = models.AgentState(**state.model_dump())
        db.add(db_state)

    db.commit()
    db.refresh(db_state)
    return db_state

# Delete might be needed for cleanup
def delete_agent_state(db: Session, state_id: uuid.UUID):
    db_state = get_agent_state(db, state_id)
    if not db_state:
        return None
    db.delete(db_state)
    db.commit()
    return db_state

