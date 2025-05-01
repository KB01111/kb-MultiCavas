from sqlalchemy.orm import Session
from sqlalchemy import select, delete
import uuid

from .. import models, schemas

def get_team(db: Session, team_id: uuid.UUID):
    return db.get(models.Team, team_id)

def get_teams(db: Session, skip: int = 0, limit: int = 100):
    result = db.execute(select(models.Team).offset(skip).limit(limit))
    return result.scalars().all()

def create_team(db: Session, team: schemas.TeamCreate):
    db_team = models.Team(**team.model_dump())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

def update_team(db: Session, team_id: uuid.UUID, team_update: schemas.TeamUpdate):
    db_team = get_team(db, team_id)
    if not db_team:
        return None
    update_data = team_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_team, key, value)
    db.commit()
    db.refresh(db_team)
    return db_team

def delete_team(db: Session, team_id: uuid.UUID):
    db_team = get_team(db, team_id)
    if not db_team:
        return None
    # Need to handle related entities (e.g., team_agents, conversations) if necessary
    # For simplicity, just deleting the team for now. Cascade deletes might be better.
    db.execute(delete(models.TeamAgent).where(models.TeamAgent.team_id == team_id))
    db.delete(db_team)
    db.commit()
    return db_team

def add_agent_to_team(db: Session, team_id: uuid.UUID, agent_id: uuid.UUID, role: str = None):
    db_team_agent = models.TeamAgent(team_id=team_id, agent_id=agent_id, role=role)
    db.add(db_team_agent)
    db.commit()
    db.refresh(db_team_agent)
    return db_team_agent

def remove_agent_from_team(db: Session, team_id: uuid.UUID, agent_id: uuid.UUID):
    result = db.execute(
        delete(models.TeamAgent)
        .where(models.TeamAgent.team_id == team_id)
        .where(models.TeamAgent.agent_id == agent_id)
    )
    db.commit()
    return result.rowcount > 0 # Return True if deletion happened

