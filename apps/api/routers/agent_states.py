from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from .. import crud, models, schemas
from ..dependencies import get_db # Assuming a dependency function to get DB session

router = APIRouter(
    prefix="/states",
    tags=["agent_states"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.AgentStateResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_agent_state(state: schemas.AgentStateCreateOrUpdate, db: Session = Depends(get_db)):
    # Check if conversation and agent exist
    db_conversation = crud.conversation.get_conversation(db, conversation_id=state.conversation_id)
    if not db_conversation:
        raise HTTPException(status_code=404, detail=f"Conversation with id {state.conversation_id} not found")
    db_agent = crud.agent.get_agent(db, agent_id=state.agent_id)
    if not db_agent:
        raise HTTPException(status_code=404, detail=f"Agent with id {state.agent_id} not found")

    return crud.agent_state.create_or_update_agent_state(db=db, state=state)

@router.get("/", response_model=List[schemas.AgentStateResponse])
def read_agent_states(
    conversation_id: uuid.UUID = Query(..., description="Filter states by conversation ID"),
    agent_id: Optional[uuid.UUID] = Query(None, description="Optionally filter states by agent ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Check if conversation exists
    db_conversation = crud.conversation.get_conversation(db, conversation_id=conversation_id)
    if not db_conversation:
        raise HTTPException(status_code=404, detail=f"Conversation with id {conversation_id} not found")

    states = crud.agent_state.get_agent_states_by_conversation(db, conversation_id=conversation_id, agent_id=agent_id, skip=skip, limit=limit)
    return states

@router.get("/{state_id}", response_model=schemas.AgentStateResponse)
def read_agent_state(state_id: uuid.UUID, db: Session = Depends(get_db)):
    db_state = crud.agent_state.get_agent_state(db, state_id=state_id)
    if db_state is None:
        raise HTTPException(status_code=404, detail="Agent state not found")
    return db_state

@router.delete("/{state_id}", response_model=schemas.AgentStateResponse)
def delete_agent_state(state_id: uuid.UUID, db: Session = Depends(get_db)):
    db_state = crud.agent_state.delete_agent_state(db, state_id=state_id)
    if db_state is None:
        raise HTTPException(status_code=404, detail="Agent state not found")
    return db_state

