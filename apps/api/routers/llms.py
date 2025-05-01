from typing import AsyncGenerator

import psycopg.errors
from fastapi import APIRouter
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from sse_starlette.sse import EventSourceResponse
from starlette.responses import Response

from api.core.agent.orchestration import get_config, get_graph
from api.core.dependencies import LLMDep, setup_graph
from api.core.logs import print, uvicorn

router = APIRouter(tags=["chat"])


@router.get("/chat/completions")
async def completions(query: str, llm: LLMDep) -> Response:
    """
    Stream model completions as Server-Sent Events (SSE).

    This endpoint sends the model's responses in real-time as they are generated,
    allowing for a continuous stream of data to the client.
    """
    return EventSourceResponse(stream_completions(query, llm))


@router.get("/chat/agent")
async def agent(query: str, llm: LLMDep) -> Response:
    """Stream LangGraph completions as Server-Sent Events (SSE).

    This endpoint streams LangGraph-generated events in real-time, allowing the client
    to receive responses as they are processed, useful for agent-based workflows.
    """
    return EventSourceResponse(stream_graph(query, llm))


async def stream_completions(
    query: str, llm: LLMDep
) -> AsyncGenerator[dict[str, str], None]:
    async for chunk in llm.astream_events(query):
        yield dict(data=chunk)


async def checkpointer_setup(pool):
    checkpointer = AsyncPostgresSaver(pool)
    try:
        await checkpointer.setup()
    except (
        psycopg.errors.DuplicateColumn,
        psycopg.errors.ActiveSqlTransaction,
    ):
        uvicorn.warning("Skipping checkpointer setup — already configured.")
    return checkpointer


async def stream_graph(
    query: str,
    llm: LLMDep,
) -> AsyncGenerator[dict[str, str], None]:
    async with setup_graph() as resource:
        graph = get_graph(
            llm,
            tools=resource.tools,
            checkpointer=resource.checkpointer,
        )
        config = get_config()
        events = dict(messages=[HumanMessage(content=query)])

        async for event in graph.astream_events(events, config, version="v2"):
            if event.get("event").endswith("end"):
                print(event)
            yield dict(data=event)
