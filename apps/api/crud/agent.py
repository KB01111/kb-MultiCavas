from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid

from .. import models, schemas

def get_agent(db: Session, agent_id: uuid.UUID):
    return db.get(models.Agent, agent_id)

def get_agents(db: Session, skip: int = 0, limit: int = 100):
    result = db.execute(select(models.Agent).offset(skip).limit(limit))
    return result.scalars().all()

def create_agent(db: Session, agent: schemas.AgentCreate):
    db_agent = models.Agent(**agent.model_dump())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

def update_agent(db: Session, agent_id: uuid.UUID, agent_update: schemas.AgentUpdate):
    db_agent = get_agent(db, agent_id)
    if not db_agent:
        return None
    update_data = agent_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_agent, key, value)
    db.commit()
    db.refresh(db_agent)
    return db_agent

def delete_agent(db: Session, agent_id: uuid.UUID):
    db_agent = get_agent(db, agent_id)
    if not db_agent:
        return None
    db.delete(db_agent)
    db.commit()
    return db_agent

