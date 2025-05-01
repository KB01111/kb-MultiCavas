from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from .. import crud, models, schemas
from ..dependencies import get_db # Assuming a dependency function to get DB session

router = APIRouter(
    prefix="/teams",
    tags=["teams"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(team: schemas.TeamCreate, db: Session = Depends(get_db)):
    return crud.team.create_team(db=db, team=team)

@router.get("/", response_model=List[schemas.TeamResponse])
def read_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    teams = crud.team.get_teams(db, skip=skip, limit=limit)
    return teams

@router.get("/{team_id}", response_model=schemas.TeamResponse)
def read_team(team_id: uuid.UUID, db: Session = Depends(get_db)):
    db_team = crud.team.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.put("/{team_id}", response_model=schemas.TeamResponse)
def update_team(team_id: uuid.UUID, team_update: schemas.TeamUpdate, db: Session = Depends(get_db)):
    db_team = crud.team.update_team(db, team_id=team_id, team_update=team_update)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.delete("/{team_id}", response_model=schemas.TeamResponse)
def delete_team(team_id: uuid.UUID, db: Session = Depends(get_db)):
    db_team = crud.team.delete_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    # Note: The crud function handles deleting associated team_agents records
    return db_team

# --- Team Agent Management ---

@router.post("/{team_id}/agents", status_code=status.HTTP_201_CREATED)
def add_agent_to_team(team_id: uuid.UUID, team_agent_data: schemas.TeamAgentUpdate, db: Session = Depends(get_db)):
    # Check if team and agent exist
    db_team = crud.team.get_team(db, team_id=team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    db_agent = crud.agent.get_agent(db, agent_id=team_agent_data.agent_id)
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Add agent to team (consider checking for duplicates if needed)
    crud.team.add_agent_to_team(db, team_id=team_id, agent_id=team_agent_data.agent_id, role=team_agent_data.role)
    return {"message": f"Agent {team_agent_data.agent_id} added to team {team_id}"}

@router.delete("/{team_id}/agents/{agent_id}", status_code=status.HTTP_200_OK)
def remove_agent_from_team(team_id: uuid.UUID, agent_id: uuid.UUID, db: Session = Depends(get_db)):
    # Check if team and agent exist (optional, depends on desired behavior)
    # db_team = crud.team.get_team(db, team_id=team_id)
    # if not db_team:
    #     raise HTTPException(status_code=404, detail="Team not found")
    # db_agent = crud.agent.get_agent(db, agent_id=agent_id)
    # if not db_agent:
    #     raise HTTPException(status_code=404, detail="Agent not found")

    deleted = crud.team.remove_agent_from_team(db, team_id=team_id, agent_id=agent_id)
    if not deleted:
        # This could mean the team/agent didn't exist, or the agent wasn't in the team
        raise HTTPException(status_code=404, detail="Agent not found in team or team/agent does not exist")
    return {"message": f"Agent {agent_id} removed from team {team_id}"}

