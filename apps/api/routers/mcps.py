from typing import Iterable

from fastapi import APIRouter
from mcp import types

from api.core.mcps import mcp_sse_client
from shared_mcp.models import ToolRequest

router = APIRouter(prefix="/mcps", tags=["mcps"])


@router.get("/list-tools")
async def list_tools() -> Iterable[types.Tool]:
    """
    Lists tools available from MCP server

    This endpoint establishes a Server-Sent Events connection with the client
    and forwards communication to the Model Context Protocol server.
    """
    async with mcp_sse_client() as session:
        response = await session.list_tools()
        return response.tools


@router.post("/call-tool")
async def call_tool(request: ToolRequest) -> str:
    """
    Calls tool available from MCP server

    This endpoint establishes a Server-Sent Events connection with the client
    and forwards communication to the Model Context Protocol server.
    """
    async with mcp_sse_client() as session:
        response = await session.call_tool(
            request.tool_name,
            arguments=request.model_dump(exclude=["tool_name"]),
        )
        return response.content[0].text
