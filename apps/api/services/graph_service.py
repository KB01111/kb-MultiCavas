# apps/api/services/graph_service.py
import os
import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from langgraph.graph.message import AnyMessage, HumanMessage, AIMessage, ToolMessage
from mem0 import Memory
from dotenv import load_dotenv

from ..graphs.graph import app_graph
from ..graphs.state import AgentState
from ..crud import message as crud_message
from ..crud import agent_state as crud_agent_state
from ..schemas.message import MessageCreate
from ..schemas.agent_state import AgentStateCreateOrUpdate

# Load environment variables from .env file
load_dotenv()

# --- Memory Initialization ---

def get_memory_for_conversation(conversation_id: str, user_id: str = "default_user") -> Memory:
    """Initializes or retrieves a mem0 Memory instance for a conversation/user."""
    # Configure mem0 to use Neo4j graph store
    neo4j_uri = os.getenv("NEO4J_URI", "neo4j://localhost:7687")
    neo4j_user = os.getenv("NEO4J_USERNAME", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD", "changeme")

    config = {
        "vector_store": {
            "provider": "qdrant", # Default vector store, can be configured
            "config": {
                "host": "localhost",
                "port": 6333,
            }
        },
        "graph_store": {
            "provider": "neo4j",
            "config": {
                "url": neo4j_uri,
                "username": neo4j_user,
                "password": neo4j_password
            }
        },
        # Add LLM config if needed, otherwise uses mem0 default
        # "llm": {
        #     "provider": "openai",
        #     "config": {
        #         "model": "gpt-4o",
        #         "api_key": os.getenv("OPENAI_API_KEY")
        #     }
        # }
    }
    # Initialize memory - mem0 handles persistence based on config
    # We might associate memory with user_id or conversation_id depending on desired scope
    # Using user_id as per mem0 graph examples
    print(f"[Graph Service] Initializing mem0 with Neo4j for user: {user_id}")
    return Memory.from_config(config_dict=config)

# --- Agent/Team Logic ---

# TODO: Replace with actual agent/team fetching logic
def get_initial_agent_id(conversation_id: str, db: Session) -> str:
    # Placeholder: Determine the first agent to act in a conversation
    print(f"[Graph Service] Determining initial agent for conv {conversation_id}")
    return "agent_1" # Placeholder

# --- Message Conversion ---

def _convert_db_messages_to_graph_messages(db_messages: List[Any]) -> List[AnyMessage]:
    """Converts messages retrieved from the database to LangGraph message format."""
    graph_messages = []
    for msg in db_messages:
        content = msg.content
        if msg.sender_type == "user":
            graph_messages.append(HumanMessage(content=content, id=str(msg.id)))
        elif msg.sender_type == "agent":
            graph_messages.append(AIMessage(content=content, id=str(msg.id)))
        elif msg.sender_type == "tool":
            tool_call_id = msg.metadata.get("tool_call_id", "unknown_tool_call")
            graph_messages.append(ToolMessage(content=content, tool_call_id=tool_call_id, id=str(msg.id)))
    return graph_messages

# --- Graph Execution ---

async def run_graph_for_conversation(conversation_id: str, input_message: HumanMessage, db: Session):
    """Runs the LangGraph for a given conversation, integrating mem0."""
    print(f"[Graph Service] Running graph for conv {conversation_id}")

    # Assume a user_id is associated with the conversation or derived
    # For simplicity, using conversation_id as user_id for memory scope
    user_id_for_memory = f"conv_{conversation_id}"

    # 1. Initialize Memory
    memory = get_memory_for_conversation(conversation_id, user_id=user_id_for_memory)

    # 2. Load existing conversation state (messages)
    db_messages = crud_message.get_messages_by_conversation(db, conversation_id=conversation_id, limit=50)
    graph_messages = _convert_db_messages_to_graph_messages(db_messages)
    graph_messages.append(input_message) # Add the new user message

    # Add new user message to memory
    try:
        memory.add(input_message.content, user_id=user_id_for_memory, metadata={
            "conversation_id": conversation_id,
            "message_id": str(input_message.id) if input_message.id else str(uuid.uuid4()),
            "sender_type": "user"
        })
        print(f"[Graph Service] Added user message to mem0 for user: {user_id_for_memory}")
    except Exception as e:
        print(f"[Graph Service] Error adding user message to mem0: {e}")

    # Determine the agent to start with
    current_agent_id = get_initial_agent_id(conversation_id, db)

    # 3. Prepare initial graph state (including memory)
    initial_state: AgentState = {
        "messages": graph_messages,
        "conversation_id": conversation_id,
        "current_agent_id": current_agent_id,
        "memory": memory, # Pass memory instance to the graph
        "next_node": None,
    }

    # 4. Invoke the graph
    final_state = None
    print(f"[Graph Service] Invoking graph with initial state for conv {conversation_id}")
    async for event in app_graph.astream(initial_state, config={"recursion_limit": 50}):
        node_name = list(event.keys())[0]
        node_output = event[node_name]
        print(f"--- Graph Event ({conversation_id}): Node ", node_name, " Output ---")
        if isinstance(node_output, dict):
             final_state = node_output

    print(f"[Graph Service] Graph execution finished for conv {conversation_id}")

    # 5. Process final state (save new messages, update memory)
    last_ai_message = None
    if final_state and "messages" in final_state:
        new_graph_messages = final_state["messages"][len(graph_messages):]
        print(f"[Graph Service] New messages from graph: {len(new_graph_messages)}")
        for msg in new_graph_messages:
            sender_type = "unknown"
            agent_id = None
            metadata = {}
            msg_content = str(msg.content)
            msg_id = str(msg.id) if msg.id else str(uuid.uuid4())

            if isinstance(msg, AIMessage):
                sender_type = "agent"
                agent_id = final_state.get("current_agent_id")
                last_ai_message = msg # Keep track of the last AI response
                # Add AI message to memory
                try:
                    memory.add(msg_content, user_id=user_id_for_memory, metadata={
                        "conversation_id": conversation_id,
                        "message_id": msg_id,
                        "sender_type": "agent",
                        "agent_id": agent_id
                    })
                    print(f"[Graph Service] Added agent message to mem0 for user: {user_id_for_memory}")
                except Exception as e:
                    print(f"[Graph Service] Error adding agent message to mem0: {e}")

            elif isinstance(msg, ToolMessage):
                sender_type = "tool"
                metadata = {"tool_call_id": msg.tool_call_id}
                # Add Tool message/result to memory
                try:
                    memory.add(f"Tool Result ({msg.tool_call_id}): {msg_content}", user_id=user_id_for_memory, metadata={
                        "conversation_id": conversation_id,
                        "message_id": msg_id,
                        "sender_type": "tool",
                        "tool_call_id": msg.tool_call_id
                    })
                    print(f"[Graph Service] Added tool message to mem0 for user: {user_id_for_memory}")
                except Exception as e:
                    print(f"[Graph Service] Error adding tool message to mem0: {e}")

            elif isinstance(msg, HumanMessage):
                 continue # Already added before graph invocation

            # Save message to PostgreSQL DB
            if sender_type != "unknown":
                message_create = MessageCreate(
                    conversation_id=uuid.UUID(conversation_id),
                    agent_id=uuid.UUID(agent_id) if agent_id else None,
                    content=msg_content,
                    sender_type=sender_type,
                    metadata=metadata
                )
                # Use msg_id from graph message if available, otherwise let DB generate
                # Note: Ensure your CRUD/model handles ID assignment correctly
                crud_message.create_message(db=db, message=message_create)
                print(f"[Graph Service] Saved {sender_type} message to DB.")

    # TODO: Save the final agent state if needed for persistence

    # 6. Return the last AI message
    return last_ai_message

