# AI Agent Canvas & Playground

This project provides a comprehensive platform for building, testing, and managing AI agents and agent teams. It integrates various open-source tools and frameworks to create a flexible and powerful playground environment.

## Features

*   **Agent Management:** Create, view, and configure individual AI agents with specific system prompts and configurations (e.g., LLM models).
*   **Team Management:** Group agents into teams for collaborative tasks.
*   **Conversation Interface:** Engage in conversations with agents or teams through a web-based chat interface.
*   **Visual Workflow Builder:** Design agent interactions and workflows using a drag-and-drop canvas based on React Flow (integrated from SimStudio AI).
*   **LangGraph Backend:** Orchestrate agent execution flows using LangGraph for complex state management and conditional logic.
*   **MCP Integration:** Exposes agent interactions via the Model Context Protocol (MCP) for standardized communication.
*   **Graph-Based Memory:** Utilizes `mem0` with a Neo4j backend (credentials managed via `.env.db`) to provide agents with persistent graph-based memory.
*   **Modular Architecture:** Built with a monorepo structure using FastAPI for the backend API and Next.js for the frontend web application.
*   **Containerized Deployment:** Uses Docker and Docker Compose for easy setup, with optimized multi-stage Dockerfiles for production readiness.
*   **Comprehensive Testing & QA:** Includes unit tests (Pytest, Jest/React Testing Library), integration tests, end-to-end tests (Playwright), static code analysis (Ruff, ESLint), and security scanning (Bandit, npm audit, pip-audit).
*   **CI/CD Pipeline:** Configured with GitHub Actions for automated linting, security scans, testing, and coverage reporting on push/pull requests.
*   **Production-Ready Logging:** Structured JSON logging for the backend API, configurable via `LOG_LEVEL` environment variable.

## Tech Stack

*   **Backend:** FastAPI (Python), LangGraph, LangChain, `mem0`, SQLAlchemy, Pydantic, `uv` (Python packaging).
*   **Frontend:** Next.js (React), TypeScript, Tailwind CSS, Shadcn/ui, Zustand, React Flow, `pnpm` (package manager).
*   **Databases:** PostgreSQL (application data), Neo4j (`mem0` graph memory).
*   **Testing & QA:** Pytest, Jest, React Testing Library, Playwright, Locust, Bandit, Ruff (linting), ESLint, `pip-audit` (Python dependency audit), `npm audit` (JS dependency audit).
*   **DevOps:** Docker, Docker Compose, GitHub Actions, Make.

## Getting Started

Detailed instructions for setting up the development environment, running the application, and executing tests can befound in the [DEPLOYMENT.md](./DEPLOYMENT.md) file.

**Quick Start:**

1.  **Clone the repository.**
2.  **Configure environment variables:**
    *   Create `.env.db` from `.env.db.example` (for database and Neo4j service credentials like `NEO4J_USER`, `NEO4J_PASSWORD`).
    *   Create `apps/api/.env` from `.env.backend.example` (for API settings like `OPENAI_API_KEY`, API's Neo4j connection details, and `LOG_LEVEL`).
    *   Create `apps/web/.env` from `apps/web/.env.example` (for frontend settings).
    *   Fill in necessary values, especially `OPENAI_API_KEY`. See [DEPLOYMENT.md](./DEPLOYMENT.md) for more details.
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

This command will build the necessary images and run backend (Pytest) and frontend (Jest) tests, as well as integration tests involving the databases. The CI pipeline also performs these tests along with linting and security scans automatically.

## End-to-End and Performance Testing

These advanced tests require a running application environment and are recommended to be executed as part of a pre-release checklist or before merging significant changes to the main branch.

### Playwright End-to-End Tests

Playwright tests are used for end-to-end testing of the frontend application.

**Prerequisites:**
*   The full application (both `web` and `api` services) must be running. You can start them using:
    ```bash
    docker compose up -d # Or make up
    ```

**Execution:**
*   Navigate to the `apps/web` directory and run the tests:
    ```bash
    cd apps/web
    npx playwright test e2e
    ```
    Alternatively, if your environment is set up for it, you might be able to execute them via `docker compose exec`:
    ```bash
    docker compose exec web npx playwright test e2e
    ```
    Refer to the Playwright configuration at `apps/web/playwright.config.ts` and test files in `apps/web/e2e/` for more details.

### Locust Performance Tests

Locust is used for performance testing the API.

**Prerequisites:**
*   The backend API service must be running. This is typically available if the full application is up.
*   Locust must be installed in your Python environment (`pip install locust`).

**Execution:**
*   The `locustfile.py` defines the performance tests. The project's README previously indicated this file is in the root directory. However, at the time of writing this documentation, it was not found there. Assuming it exists in the root as previously stated, the command to run Locust would be:
    ```bash
    locust -f locustfile.py --host=http://localhost:8000
    ```
    Replace `http://localhost:8000` with the actual API URL if different.
*   Once Locust is running, you can access the web UI to start and monitor tests at `http://localhost:8089` (by default).

**Note on `locustfile.py`:** If `locustfile.py` is located elsewhere, adjust the `-f` path in the command accordingly.

## Frontend Error Tracking and Logging

Effective error tracking and logging for the frontend application (`apps/web`) is crucial for diagnosing issues and understanding user experience in production. A two-pronged approach is recommended:

### Client-Side Error Reporting

For capturing errors that occur in the user's browser:

*   **Recommendation:** Integrate a dedicated third-party client-side error reporting service. Popular choices include:
    *   [Sentry](https://sentry.io/)
    *   [LogRocket](https://logrocket.com/)
    *   [Datadog RUM](https://www.datadoghq.com/product/real-user-monitoring/)
    *   [New Relic Browser](https://newrelic.com/platform/browser-monitoring)
*   **Benefits:**
    *   Captures unhandled JavaScript errors, unhandled promise rejections, and other client-side exceptions.
    *   Provides detailed stack traces, browser context (OS, browser version, user agent), and often network request information.
    *   Many services offer session replay capabilities, allowing developers to see user interactions leading up to an error.
    *   Aggregates and alerts on new or frequently occurring errors.
*   **Implementation:** Specific integration steps depend on the chosen service. Typically, it involves adding a small JavaScript snippet or SDK to the Next.js application, often in `_app.tsx` or a similar entry point, and configuring it with an API key. This setup is beyond the scope of the current project configuration but is highly recommended for any production deployment.

### Server-Side Logging (Next.js Backend)

For logging activity and errors occurring within the Next.js server environment (e.g., API routes, React Server Components, server-side rendering logic):

*   **Standard Output:** Any `console.log()`, `console.warn()`, `console.error()`, or similar calls made in Next.js API routes, server-side data fetching functions (like `getServerSideProps`), or React Server Components will output to the standard output (`stdout`) and standard error (`stderr`) streams of the `web` Docker container.
*   **Containerized Environment:**
    *   The `apps/web/Dockerfile` is configured to run the Next.js application using `CMD ["node", "server.js"]`. This setup ensures that all console output from the Node.js process is directed to the container's `stdout/stderr`.
    *   In a production environment, these logs should be collected, aggregated, and managed by the container orchestration platform's logging solution (e.g., Docker daemon logging drivers like `json-file` or `journald`, or solutions integrated with Kubernetes like Fluentd, Elasticsearch, Loki).
*   **Content:** These server-side logs are useful for debugging issues related to API handlers, server-side rendering failures, and other backend aspects of the Next.js application. While not as rich in client-side context as dedicated error reporting services, they are essential for understanding server behavior.

By combining a client-side error reporting service with proper collection of server-side container logs, developers can achieve comprehensive visibility into the frontend application's health and behavior.

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
│   │   ├── .env.example      # (Note: .env.backend.example in root is the primary source)
│   │   ├── Dockerfile        # Multi-stage, production-optimized
│   │   ├── main.py           # FastAPI app entrypoint, includes logging setup
│   │   ├── pyproject.toml    # Python dependencies (managed with uv)
│   │   └── uv.lock           # uv lock file
│   └── web/                  # Frontend Next.js application
│       ├── src/
│       │   ├── app/          # Next.js App Router pages and layouts
│       │   ├── components/   # React components (UI, features)
│       │   ├── lib/          # Libraries, utilities, services
│       │   └── stores/       # State management (Zustand)
│       ├── e2e/              # End-to-end tests (Playwright)
│       ├── public/
│       ├── .env.example      # Frontend environment variables example
│       ├── Dockerfile        # Multi-stage, production-optimized (Next.js standalone)
│       ├── jest.config.js    # Jest configuration
│       ├── jest.setup.js     # Jest setup
│       ├── next.config.js    # Next.js configuration
│       ├── package.json      # Node.js dependencies
│       └── playwright.config.ts # Playwright configuration
├── .env.db.example           # Database and Neo4j service credentials example
├── .env.backend.example      # Backend API specific environment variables example
├── docker-compose.yml        # Main Docker Compose configuration for all services and profiles
├── DEPLOYMENT.md             # Detailed setup and deployment instructions
├── locustfile.py             # Locust performance test definition (Note: location to be confirmed)
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

