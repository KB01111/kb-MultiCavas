from contextlib import asynccontextmanager
from typing import Annotated, AsyncGenerator

from fastapi import Depends
from langchain_mcp_adapters.tools import load_mcp_tools
from langchain_openai import ChatOpenAI
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from api.core.agent.persistence import checkpointer_context
from api.core.config import settings
from api.core.mcps import mcp_sse_client
from api.core.models import Resource


def get_llm() -> ChatOpenAI:
    return ChatOpenAI(
        streaming=True,
        model=settings.model,
        temperature=0,
        api_key=settings.openai_api_key,
        stream_usage=True,
    )


LLMDep = Annotated[ChatOpenAI, Depends(get_llm)]


engine: AsyncEngine = create_async_engine(settings.orm_conn_str)


def get_engine() -> AsyncEngine:
    return engine


EngineDep = Annotated[AsyncEngine, Depends(get_engine)]


@asynccontextmanager
async def setup_graph() -> AsyncGenerator[Resource]:
    async with checkpointer_context(
        settings.checkpoint_conn_str
    ) as checkpointer:
        async with mcp_sse_client() as session:
            tools = await load_mcp_tools(session)
            yield Resource(
                checkpointer=checkpointer,
                tools=tools,
                session=session,
            )
