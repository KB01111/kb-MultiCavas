from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from .. import crud, models, schemas
from ..dependencies import get_db # Assuming a dependency function to get DB session

router = APIRouter(
    prefix="/messages",
    tags=["messages"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    # Check if the conversation exists
    db_conversation = crud.conversation.get_conversation(db, conversation_id=message.conversation_id)
    if db_conversation is None:
        raise HTTPException(status_code=404, detail=f"Conversation with id {message.conversation_id} not found")

    # Optional: Check if agent_id exists if provided
    if message.agent_id:
        db_agent = crud.agent.get_agent(db, agent_id=message.agent_id)
        if not db_agent:
            raise HTTPException(status_code=404, detail=f"Agent with id {message.agent_id} not found")

    return crud.message.create_message(db=db, message=message)

@router.get("/{message_id}", response_model=schemas.MessageResponse)
def read_message(message_id: uuid.UUID, db: Session = Depends(get_db)):
    db_message = crud.message.get_message(db, message_id=message_id)
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

# Note: Listing all messages globally might not be desirable.
# Listing is typically done via the conversation endpoint: /conversations/{conversation_id}/messages

