# apps/api/tests/test_memory_integration.py
import pytest
from unittest.mock import patch, AsyncMock
from neo4j import GraphDatabase # To interact with Neo4j for verification
import os

# Assuming GraphService is in apps/api/services/graph_service.py
from ..services.graph_service import GraphService
from ..schemas.conversation import ConversationCreate
from ..crud.conversation import create_conversation
from ..db import SessionLocal # For setting up conversations

# Neo4j connection details from environment (set in docker-compose.yml for backend-tester)
NEO4J_URI = os.getenv("NEO4J_URI", "neo4j://localhost:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "changeme")

@pytest.fixture(scope="module")
def neo4j_driver():
    """Provides a Neo4j driver instance for the test module."""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    yield driver
    driver.close()

@pytest.fixture(autouse=True)
async def clear_neo4j(neo4j_driver):
    """Clears the Neo4j database before each test in this module."""
    async with neo4j_driver.session() as session:
        await session.run("MATCH (n) DETACH DELETE n")

@pytest.mark.asyncio
async def test_mem0_stores_message_and_entities(neo4j_driver, client): # Use client for DB setup
    """Test if mem0 correctly stores messages and extracts entities in Neo4j."""
    service = GraphService() # Assumes mem0 is configured within GraphService/LangGraph
    db = SessionLocal()
    try:
        # 1. Setup Conversation
        conv_data = ConversationCreate(name="Mem0 Entity Test Conversation")
        conversation = await create_conversation(db=db, conversation=conv_data)
        await db.commit()
        await db.refresh(conversation)
        conversation_id = str(conversation.id) # Ensure string format if mem0 uses it

        # 2. Input message with clear entities
        user_input = "My name is Bob and I live in London."

        # 3. Mock LLM calls within the graph to isolate mem0 interaction
        #    We assume a node calls mem0.add() or similar
        #    We also assume another node might call an LLM for response generation
        with patch("langchain_openai.ChatOpenAI.ainvoke", new_callable=AsyncMock) as mock_llm_call:
            # Mock the response generation part of the graph
            mock_llm_call.return_value.content = "Hi Bob from London!"

            # 4. Run the graph via the service
            # This should trigger the node responsible for adding memory via mem0
            await service.run_graph(conversation_id=conversation_id, user_input=user_input)

        # 5. Verify Neo4j content
        async with neo4j_driver.session() as session:
            # Check if the message was stored (adjust query based on mem0 schema)
            message_nodes = await session.run(
                "MATCH (m:Message {content: $content, role: $role, conversation_id: $conv_id}) RETURN m",
                content=user_input, role="user", conv_id=conversation_id
            )
            message_record = await message_nodes.single()
            assert message_record is not None, "Message node not found in Neo4j"

            # Check if entities were extracted and stored (adjust query based on mem0 schema)
            person_nodes = await session.run("MATCH (p:Person {name: $name}) RETURN p", name="Bob")
            person_record = await person_nodes.single()
            assert person_record is not None, "Person entity 'Bob' not found"

            location_nodes = await session.run("MATCH (l:Location {name: $name}) RETURN l", name="London")
            location_record = await location_nodes.single()
            assert location_record is not None, "Location entity 'London' not found"

            # Check relationship (adjust query based on mem0 schema)
            relationship_nodes = await session.run(
                "MATCH (:Person {name: 'Bob'})-[:LIVES_IN]->(:Location {name: 'London'}) RETURN count(*) as count"
            )
            relationship_record = await relationship_nodes.single()
            assert relationship_record["count"] > 0, "LIVES_IN relationship not found"

    finally:
        await db.close()

@pytest.mark.asyncio
async def test_mem0_retrieves_memory_for_context(neo4j_driver, client):
    """Test if mem0 retrieves relevant memory to be used in context."""
    service = GraphService()
    db = SessionLocal()
    try:
        # 1. Setup Conversation
        conv_data = ConversationCreate(name="Mem0 Retrieval Test Conversation")
        conversation = await create_conversation(db=db, conversation=conv_data)
        await db.commit()
        await db.refresh(conversation)
        conversation_id = str(conversation.id)

        # 2. Pre-populate memory using mem0 directly or via graph run
        #    (Here, we simulate a previous turn stored memory)
        async with neo4j_driver.session() as session:
            await session.run(
                """CREATE (u:User {user_id: $user_id}),
                         (m:Message {id: $msg_id, conversation_id: $conv_id, role: 'user', content: 'My favorite color is blue.'}),
                         (e:Entity {name: 'blue'}),
                         (u)-[:SAID]->(m),
                         (m)-[:MENTIONS]->(e)
                """,
                user_id="test_user", msg_id="msg_past", conv_id=conversation_id
            )

        # 3. Input message that should trigger memory retrieval
        user_input = "What is my favorite color?"

        # 4. Mock the LLM call for response generation
        #    We want to check if the retrieved memory is part of the prompt sent to the LLM
        with patch("langchain_openai.ChatOpenAI.ainvoke", new_callable=AsyncMock) as mock_llm_call:
            mock_llm_call.return_value.content = "Your favorite color is blue."

            # 5. Run the graph
            # This should trigger memory retrieval and then response generation
            await service.run_graph(conversation_id=conversation_id, user_input=user_input)

        # 6. Assert that the LLM was called with context including the memory
        mock_llm_call.assert_called_once()
        call_args, _ = mock_llm_call.call_args
        prompt_messages = call_args[0] # Assuming the first argument is the list of messages/prompt

        # Check if the retrieved memory ('blue') is present in the context/prompt sent to LLM
        # This assertion depends heavily on how the graph constructs the final prompt
        prompt_text = "".join([msg.content for msg in prompt_messages if hasattr(msg, 'content')]) # Simple concatenation
        assert "blue" in prompt_text, "Retrieved memory 'blue' not found in LLM prompt context"
        assert "favorite color" in prompt_text

    finally:
        await db.close()

# Add more tests:
# - Test memory retrieval with multiple relevant memories
# - Test memory retrieval with filters (e.g., time-based)
# - Test handling of no relevant memory found
# - Test updating existing entities/relationships in memory

