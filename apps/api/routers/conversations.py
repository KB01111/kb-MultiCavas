from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from .. import crud, models, schemas
from ..dependencies import get_db # Assuming a dependency function to get DB session

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(conversation: schemas.ConversationCreate, db: Session = Depends(get_db)):
    # Optional: Check if team_id exists if provided
    if conversation.team_id:
        db_team = crud.team.get_team(db, team_id=conversation.team_id)
        if not db_team:
            raise HTTPException(status_code=404, detail=f"Team with id {conversation.team_id} not found")
    return crud.conversation.create_conversation(db=db, conversation=conversation)

@router.get("/", response_model=List[schemas.ConversationResponse])
def read_conversations(
    user_id: Optional[str] = Query(None, description="Filter conversations by user ID"),
    team_id: Optional[uuid.UUID] = Query(None, description="Filter conversations by team ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    conversations = crud.conversation.get_conversations(db, user_id=user_id, team_id=team_id, skip=skip, limit=limit)
    return conversations

@router.get("/{conversation_id}", response_model=schemas.ConversationResponse)
def read_conversation(conversation_id: uuid.UUID, db: Session = Depends(get_db)):
    db_conversation = crud.conversation.get_conversation(db, conversation_id=conversation_id)
    if db_conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return db_conversation

@router.put("/{conversation_id}", response_model=schemas.ConversationResponse)
def update_conversation(conversation_id: uuid.UUID, conversation_update: schemas.ConversationUpdate, db: Session = Depends(get_db)):
    db_conversation = crud.conversation.update_conversation(db, conversation_id=conversation_id, conversation_update=conversation_update)
    if db_conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return db_conversation

@router.delete("/{conversation_id}", response_model=schemas.ConversationResponse)
def delete_conversation(conversation_id: uuid.UUID, db: Session = Depends(get_db)):
    db_conversation = crud.conversation.delete_conversation(db, conversation_id=conversation_id)
    if db_conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    # Note: Related messages, states, evaluations might need manual deletion or cascade setup
    return db_conversation

# --- Add endpoint to get messages for a conversation ---
# (Could also be in a message router)
@router.get("/{conversation_id}/messages", response_model=List[schemas.MessageResponse])
def read_conversation_messages(
    conversation_id: uuid.UUID,
    skip: int = 0,
    limit: int = 1000, # Default to a higher limit for messages
    db: Session = Depends(get_db)
):
    # First check if conversation exists
    db_conversation = crud.conversation.get_conversation(db, conversation_id=conversation_id)
    if db_conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Assuming a crud function exists for messages
    messages = crud.message.get_messages_by_conversation(db, conversation_id=conversation_id, skip=skip, limit=limit)
    return messages

