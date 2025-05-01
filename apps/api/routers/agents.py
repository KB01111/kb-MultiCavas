from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from .. import crud, models, schemas
from ..dependencies import get_db # Assuming a dependency function to get DB session

router = APIRouter(
    prefix="/agents",
    tags=["agents"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.AgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db)):
    # Potential check for duplicate agent names could be added here
    return crud.agent.create_agent(db=db, agent=agent)

@router.get("/", response_model=List[schemas.AgentResponse])
def read_agents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    agents = crud.agent.get_agents(db, skip=skip, limit=limit)
    return agents

@router.get("/{agent_id}", response_model=schemas.AgentResponse)
def read_agent(agent_id: uuid.UUID, db: Session = Depends(get_db)):
    db_agent = crud.agent.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@router.put("/{agent_id}", response_model=schemas.AgentResponse)
def update_agent(agent_id: uuid.UUID, agent_update: schemas.AgentUpdate, db: Session = Depends(get_db)):
    db_agent = crud.agent.update_agent(db, agent_id=agent_id, agent_update=agent_update)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@router.delete("/{agent_id}", response_model=schemas.AgentResponse)
def delete_agent(agent_id: uuid.UUID, db: Session = Depends(get_db)):
    db_agent = crud.agent.delete_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

