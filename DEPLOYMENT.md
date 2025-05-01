# Deployment Guide

This document provides instructions for setting up, running, and testing the AI Agent Canvas application locally using Docker Compose.

## Prerequisites

*   Docker: [Install Docker](https://docs.docker.com/get-docker/)
*   Docker Compose: Usually included with Docker Desktop. For Linux, install the plugin: [Install Docker Compose](https://docs.docker.com/compose/install/)
*   Make (Optional, but recommended for using Makefile shortcuts)
*   Git (For cloning the repository)

## 1. Clone the Repository

```bash
git clone <repository-url>
cd canvas-app
```

## 2. Environment Configuration

The application uses environment variables for configuration. Example files are provided. You need to create the actual `.env` files from these examples.

*   **Database Configuration (`.env.db`):**
    Copy the example file:
    ```bash
    make env-db
    # or manually: cp .env.db.example .env.db
    ```
    Review `.env.db` and change `POSTGRES_PASSWORD` if desired (ensure it matches API config if changed).

*   **Backend API Configuration (`apps/api/.env`):**
    Copy the example file:
    ```bash
    make env-api
    # or manually: cp apps/api/.env.example apps/api/.env
    ```
    Edit `apps/api/.env` and provide:
    *   `OPENAI_API_KEY`: Your OpenAI API key.
    *   `POSTGRES_DSN`: The connection string for the PostgreSQL database. The default value usually works with the Docker Compose setup: `postgresql+psycopg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`. Ensure the credentials match `.env.db`.
    *   Neo4j variables (`NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`) usually don't need changes for the default Docker setup unless you modified the Neo4j service configuration.

*   **Frontend Configuration (`apps/web/.env`):**
    Copy the example file:
    ```bash
    cp apps/web/.env.example apps/web/.env
    ```
    The default `NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"` should work when accessing the frontend directly via `http://localhost:3000` in your browser, as the browser will make requests to the API exposed on port 8000.

## 3. Build and Run the Application

Use the Makefile for convenience:

*   **Build Docker images:**
    ```bash
    make build
    ```
*   **Start all services (DB, Neo4j, API, Web) in detached mode:**
    ```bash
    make up
    ```

Alternatively, use Docker Compose directly:

```bash
docker compose build
docker compose up -d
```

Once the services are up:

*   The **Frontend** should be accessible at `http://localhost:3000`.
*   The **Backend API** should be accessible at `http://localhost:8000` (e.g., Swagger UI at `http://localhost:8000/docs`).
*   The **Neo4j Browser** should be accessible at `http://localhost:7474` (use `neo4j/changeme` to log in initially).

## 4. Running Tests

The `docker-compose.yml` file includes a `test` profile with services configured to run backend and frontend tests.

1.  **Ensure dummy environment files exist** (the CI script does this, but you might need to locally):
    ```bash
    make env-db
    make env-api
    cp apps/web/.env.example apps/web/.env
    # Add dummy keys to apps/api/.env if needed by tests
    # echo "OPENAI_API_KEY=dummy_key_for_testing" >> apps/api/.env
    ```

2.  **Run tests using the `test` profile:**
    ```bash
    docker compose --profile test up --build --abort-on-container-exit
    ```
    *   `--profile test`: Activates the `backend-tester` and `frontend-tester` services (and dependencies like `db`, `neo4j`).
    *   `--build`: Ensures images are built before running.
    *   `--abort-on-container-exit`: Stops all services if any container (including a test runner) exits. The exit code of the first container to exit will be the exit code of the `docker compose` command.

    The output will show the results from both `pytest` (backend) and `jest` (frontend).

## 5. Other Useful Commands (Makefile)

*   **Stop and remove containers:** `make down`
*   **View logs:** `make logs` (add service name for specific logs, e.g., `make logs service=api`)
*   **List running services:** `make ps`
*   **Clean up stopped containers/dangling images:** `make clean`
*   **Prune all unused Docker objects (use with caution):** `make prune`

## 6. Accessing Services

*   **Web UI:** `http://localhost:3000`
*   **API Docs (Swagger):** `http://localhost:8000/docs`
*   **Neo4j Browser:** `http://localhost:7474`
*   **Database:** Connect using a PostgreSQL client to `localhost:5432` with credentials from `.env.db`.

