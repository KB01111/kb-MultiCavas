from fastapi import APIRouter
from sqlalchemy import text

from api.core.dependencies import EngineDep
from api.core.logs import uvicorn

TABLES = [
    "checkpoints",
    "checkpoint_migrations",
    "checkpoint_blobs",
    "checkpoint_writes",
]
router = APIRouter(tags=["checkpoints"])


@router.delete("/truncate")
async def truncate_checkpoints(engine: EngineDep):
    """
    Truncates all checkpoint-related tables from LangGraph AsyncPostgresSaver.

    This operation removes all records from the following tables:
    - checkpoints
    - checkpoint_migrations
    - checkpoint_blobs
    - checkpoint_writes

    **Warning**: This action is irreversible and should be used with caution. Ensure proper backups are in place
    before performing this operation.
    """

    async with engine.begin() as conn:
        for table in TABLES:
            await conn.execute(text(f"TRUNCATE TABLE {table};"))
            uvicorn.info(f"Truncated table {table}")
    return {
        "status": "success",
        "message": "All checkpoint-related tables truncated successfully.",
    }
