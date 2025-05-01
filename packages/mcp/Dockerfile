FROM ghcr.io/astral-sh/uv:python3.13-bookworm

WORKDIR /app
COPY ./backend/mcp/uv.lock ./backend/mcp/pyproject.toml .
RUN uv sync --frozen && rm ./uv.lock ./pyproject.toml
RUN apt-get update && apt-get install -y --no-install-recommends curl
COPY ./backend/mcp ./mcp
COPY ./backend/shared_mcp ./shared_mcp
ENV PYTHONPATH /app:$PYTHONPATH
ENTRYPOINT ["uv", "run", "mcp/main.py"]
