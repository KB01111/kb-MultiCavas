# apps/api/graphs/state.py
from typing import TypedDict, Sequence, Annotated, List, Dict, Any
from langgraph.graph.message import AnyMessage
from mem0 import Memory # Import mem0 Memory class

# Define the state for our agent graph
class AgentState(TypedDict):
    """Represents the state of our graph.

    Attributes:
        messages: The list of messages exchanged so far.
        next_node: The next node to call.
        current_agent_id: The ID of the agent currently acting.
        conversation_id: The ID of the current conversation.
        memory: An instance of mem0 Memory for the current context (e.g., conversation).
        # Add other relevant state fields as needed, e.g.:
        # tool_calls: List of pending tool calls
        # agent_outcome: Result from the last agent action
        # scratchpad: Temporary data for agent reasoning
    """
    messages: Annotated[Sequence[AnyMessage], lambda x, y: x + y]
    next_node: str | None
    current_agent_id: str | None
    conversation_id: str
    memory: Memory | None # Add mem0 instance to state
    # Example additional fields:
    # tool_calls: List[Dict[str, Any]] | None
    # agent_outcome: Any | None
    # scratchpad: Dict[str, Any] | None

