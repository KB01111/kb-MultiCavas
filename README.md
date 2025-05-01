# AI Agent Canvas & Playground

This project provides a comprehensive platform for building, testing, and managing AI agents and agent teams. It integrates various open-source tools and frameworks to create a flexible and powerful playground environment.

## Features

*   **Agent Management:** Create, view, and configure individual AI agents with specific system prompts and configurations (e.g., LLM models).
*   **Team Management:** Group agents into teams for collaborative tasks.
*   **Conversation Interface:** Engage in conversations with agents or teams through a web-based chat interface.
*   **Visual Workflow Builder:** Design agent interactions and workflows using a drag-and-drop canvas based on React Flow (integrated from SimStudio AI).
*   **LangGraph Backend:** Orchestrate agent execution flows using LangGraph for complex state management and conditional logic.
*   **MCP Integration:** Exposes agent interactions via the Model Context Protocol (MCP) for standardized communication.
*   **Graph-Based Memory:** Utilizes `mem0` with a Neo4j backend to provide agents with persistent graph-based memory, enabling entity extraction and relationship tracking.
*   **Modular Architecture:** Built with a monorepo structure using FastAPI for the backend API and Next.js for the frontend web application.
*   **Containerized Deployment:** Uses Docker and Docker Compose for easy setup, development, and testing.
*   **Comprehensive Testing:** Includes unit tests (Pytest, Jest/React Testing Library), integration tests (including mem0/Neo4j), end-to-end tests (Playwright), and basic security scanning (npm audit, Bandit).
*   **CI/CD Pipeline:** Configured with GitHub Actions for automated testing on push/pull requests.

## Tech Stack

*   **Backend:** FastAPI (Python), LangGraph, LangChain, `mem0`, SQLAlchemy, Pydantic
*   **Frontend:** Next.js (React), TypeScript, Tailwind CSS, Shadcn/ui, Zustand, React Flow
*   **Databases:** PostgreSQL (for application data), Neo4j (for `mem0` graph memory)
*   **Testing:** Pytest, Jest, React Testing Library, Playwright, Locust, Bandit
*   **DevOps:** Docker, Docker Compose, GitHub Actions, Make

## Getting Started

Detailed instructions for setting up the development environment, running the application, and executing tests can be found in the [DEPLOYMENT.md](./DEPLOYMENT.md) file.

**Quick Start:**

1.  **Clone the repository.**
2.  **Configure environment variables:** Create `.env.db`, `apps/api/.env`, and `apps/web/.env` from the `.example` files and fill in necessary values (like `OPENAI_API_KEY`). See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.
3.  **Build and run using Docker Compose:**
    ```bash
    # Ensure Docker is running
    docker compose build
    docker compose up -d
    ```
4.  **Access the application:**
    *   Frontend: `http://localhost:3000`
    *   API Docs: `http://localhost:8000/docs`
    *   Neo4j Browser: `http://localhost:7474`

## Running Tests

Tests are configured to run within Docker containers using specific profiles.

```bash
# Ensure environment files are set up (see DEPLOYMENT.md)
docker compose --profile test up --build --abort-on-container-exit
```

This command will build the necessary images and run backend (Pytest) and frontend (Jest) tests, as well as integration tests involving the databases.

End-to-end tests (Playwright) can be run against a running development environment. See the Playwright configuration (`apps/web/playwright.config.ts`) and test files (`apps/web/e2e/`) for details.

Performance tests (Locust) can be run against the running API service. See `locustfile.py` for the test definition.

## Project Structure

```
canvas-app/
├── .github/workflows/        # GitHub Actions CI configuration
├── apps/
│   ├── api/                  # Backend FastAPI application
│   │   ├── crud/             # Database CRUD operations
│   │   ├── db/               # Database session management
│   │   ├── graphs/           # LangGraph definitions
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── routers/          # API endpoint routers
│   │   ├── schemas/          # Pydantic data schemas
│   │   ├── services/         # Business logic (e.g., GraphService)
│   │   ├── tests/            # Backend tests (Pytest)
│   │   ├── .env.example      # Backend environment variables example
│   │   ├── Dockerfile
│   │   ├── main.py           # FastAPI app entrypoint
│   │   └── pyproject.toml    # Python dependencies and project config
│   └── web/                  # Frontend Next.js application
│       ├── src/
│       │   ├── app/          # Next.js App Router pages and layouts
│       │   ├── components/   # React components (UI, features)
│       │   ├── lib/          # Libraries, utilities, services
│       │   └── stores/       # State management (Zustand)
│       ├── e2e/              # End-to-end tests (Playwright)
│       ├── public/
│       ├── .env.example      # Frontend environment variables example
│       ├── Dockerfile
│       ├── jest.config.js    # Jest configuration
│       ├── jest.setup.js     # Jest setup
│       ├── next.config.js    # Next.js configuration
│       ├── package.json      # Node.js dependencies
│       └── playwright.config.ts # Playwright configuration
├── .env.db.example           # Database environment variables example
├── docker-compose.yml        # Main Docker Compose configuration
├── docker-compose.override.yml # Overrides for development/testing
├── DEPLOYMENT.md             # Detailed setup and deployment instructions
├── locustfile.py             # Locust performance test definition
├── Makefile                  # Convenience commands for Docker
└── README.md                 # This file
```

## Acknowledgements

This project integrates and builds upon the following open-source projects:

*   [open-multi-agent-canvas](https://github.com/CopilotKit/open-multi-agent-canvas) (Frontend Base)
*   [simstudioai/sim](https://github.com/simstudioai/sim) (Flow Builder Component)
*   [fastapi-mcp-langgraph-template](https://github.com/zepz/fastapi-mcp-langgraph-template) (Backend Structure Inspiration)
*   [LangGraph](https://python.langchain.com/docs/langgraph/)
*   [mem0](https://github.com/mem0ai/mem0)
*   [FastAPI](https://fastapi.tiangolo.com/)
*   [Next.js](https://nextjs.org/)
*   [React Flow](https://reactflow.dev/)

