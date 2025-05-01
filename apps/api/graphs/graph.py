# apps/api/graphs/graph.py
from langgraph.graph import StateGraph, END
from .state import AgentState
from .nodes import call_agent, execute_tools

# Define the workflow
workflow = StateGraph(AgentState)

# Define the nodes
workflow.add_node("call_agent", call_agent)
workflow.add_node("execute_tools", execute_tools)

# TODO: Define a router node/function if more complex routing is needed
# workflow.add_node("router", router_function)

# Set the entry point
workflow.set_entry_point("call_agent")

# Define the edges
workflow.add_edge("call_agent", "execute_tools") # Always try to execute tools after agent call for now
workflow.add_edge("execute_tools", "call_agent") # Loop back to agent after tools execute

# TODO: Implement conditional edges based on state["next_node"] or tool calls
# Example conditional edge:
# def should_continue(state: AgentState):
#     messages = state["messages"]
#     last_message = messages[-1]
#     # If there are no tool calls, then we finish
#     if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
#         return "end"
#     # Otherwise if there are tool calls, we continue
#     else:
#         return "continue"
#
# workflow.add_conditional_edges(
#     "call_agent",
#     should_continue,
#     {
#         "continue": "execute_tools",
#         "end": END,
#     },
# )
# workflow.add_conditional_edges(
#     "execute_tools",
#     # Logic to decide if agent needs to be called again or end
#     lambda x: "call_agent", # Simple loop back for now
#     {
#         "call_agent": "call_agent",
#         "end": END,
#     },
# )

# Compile the workflow into a runnable graph
# Use `with_config` for things like setting recursion limits
app_graph = workflow.compile()

# Optional: Visualize the graph (requires graphviz)
# try:
#     app_graph.get_graph().draw_png("graph.png")
#     print("Graph visualization saved to graph.png")
# except ImportError:
#     print("Graphviz not installed, skipping graph visualization.")

print("LangGraph workflow compiled.")

