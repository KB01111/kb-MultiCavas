FROM ghcr.io/astral-sh/uv:python3.13-bookworm

WORKDIR /app
COPY ./backend/api/uv.lock ./backend/api/pyproject.toml ./
RUN uv sync --frozen && rm ./uv.lock ./pyproject.toml
RUN apt-get update && apt-get install -y --no-install-recommends curl
COPY ./envs/backend.env /opt/.env
COPY ./backend/api /app/api
COPY ./backend/shared_mcp /app/shared_mcp
ENV PYTHONPATH /app:$PYTHONPATH
ENTRYPOINT ["uv", "run", "fastapi", "run", "api/main.py", "--root-path=/api"]
