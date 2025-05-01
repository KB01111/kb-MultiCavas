from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import uuid

from .. import crud, models, schemas
from ..dependencies import get_db # Assuming a dependency function to get DB session

router = APIRouter(
    prefix="/evaluations",
    tags=["evaluation_results"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.EvaluationResultResponse, status_code=status.HTTP_201_CREATED)
def create_evaluation_result(result: schemas.EvaluationResultCreate, db: Session = Depends(get_db)):
    # Check if the conversation exists
    db_conversation = crud.conversation.get_conversation(db, conversation_id=result.conversation_id)
    if db_conversation is None:
        raise HTTPException(status_code=404, detail=f"Conversation with id {result.conversation_id} not found")

    return crud.evaluation_result.create_evaluation_result(db=db, result=result)

@router.get("/", response_model=List[schemas.EvaluationResultResponse])
def read_evaluation_results(
    conversation_id: uuid.UUID = Query(..., description="Filter evaluation results by conversation ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Check if conversation exists
    db_conversation = crud.conversation.get_conversation(db, conversation_id=conversation_id)
    if not db_conversation:
        raise HTTPException(status_code=404, detail=f"Conversation with id {conversation_id} not found")

    results = crud.evaluation_result.get_evaluation_results_by_conversation(db, conversation_id=conversation_id, skip=skip, limit=limit)
    return results

@router.get("/{result_id}", response_model=schemas.EvaluationResultResponse)
def read_evaluation_result(result_id: uuid.UUID, db: Session = Depends(get_db)):
    db_result = crud.evaluation_result.get_evaluation_result(db, result_id=result_id)
    if db_result is None:
        raise HTTPException(status_code=404, detail="Evaluation result not found")
    return db_result

# Delete/Update endpoints might be added if needed

