import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.core.logs import setup_logging # Import the setup_logging function
from fastapi.middleware.cors import CORSMiddleware
# from langfuse.fastapi import LangfuseMiddleware # Uncomment when ready

# Import routers
from api.routers import agents, teams, conversations, messages, agent_states, evaluation_results # Core CRUD routers
from api.routers import mcp # MCP router
# from api.routers import checkpoints, llms # Original template routers (commented out if replaced/unused)
# from api.websockets import manager # Placeholder for WebSocket manager

# Placeholder for Langfuse integration - replace with actual config
# langfuse_middleware = LangfuseMiddleware(
#     secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
#     public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
#     host=os.getenv("LANGFUSE_HOST"),
# )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Initialize DB connections, etc.
    setup_logging() # Call the logging setup function
    # Original print statements will now go through the configured logger if they use logging.info
    # For example, replace print() with logging.getLogger("api").info()
    logging.getLogger("api").info("Starting up AI Agent Canvas Backend...")
    # langfuse_middleware.configure(app)
    # TODO: Initialize database connection pool if needed
    yield
    # Shutdown logic: Close connections, etc.
    logging.getLogger("api").info("Shutting down AI Agent Canvas Backend...")

app = FastAPI(
    title="AI Agent Canvas Backend",
    version="0.1.0",
    lifespan=lifespan,
    swagger_ui_parameters={"tryItOutEnabled": True}
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000", # Default Next.js dev port
    # Add production frontend URL later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Langfuse Middleware (uncomment when configured)
# app.add_middleware(LangfuseMiddleware)

--- a/apps/api/main.py
+++ b/apps/api/main.py
@@ -1,7 +1,8 @@
 import os
 from contextlib import asynccontextmanager
+import logging

 from fastapi import FastAPI

 from api.core.logs import setup_logging # Import the setup_logging function
@@ -61 +61 @@
-import logging # Add this import for the getLogger calls in lifespan

# Include Core CRUD Routers
app.include_router(agents.router, prefix="/v1", tags=["Agents"])
app.include_router(teams.router, prefix="/v1", tags=["Teams"])
app.include_router(conversations.router, prefix="/v1", tags=["Conversations"])
app.include_router(messages.router, prefix="/v1", tags=["Messages"])
app.include_router(agent_states.router, prefix="/v1", tags=["Agent States"])
app.include_router(evaluation_results.router, prefix="/v1", tags=["Evaluation Results"])

# Include MCP Router
app.include_router(mcp.router, prefix="/v1") # Tag is defined within mcp.py

# Include original template routers if still needed (commented out for now)
# app.include_router(llms.router, prefix="/v1", tags=["LLMs"])
# app.include_router(checkpoints.router, prefix="/v1", tags=["Checkpoints"])

# Placeholder for WebSocket endpoint
# @app.websocket("/ws/{chat_id}")
# async def websocket_endpoint(websocket: WebSocket, chat_id: str):
#     await manager.connect(websocket, chat_id)
#     try:
#         while True:
#             data = await websocket.receive_text()
#             # Handle incoming WebSocket messages if needed
#             # await manager.send_personal_message(f"You wrote: {data}", websocket)
#     except WebSocketDisconnect:
#         manager.disconnect(websocket, chat_id)

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

