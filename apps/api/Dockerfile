# Stage 1: Builder Stage - Install dependencies
FROM python:3.13-slim-bookworm AS builder

# Install uv
ENV UV_VERSION=0.1.49
RUN pip install uv==${UV_VERSION}

# Create a virtual environment
WORKDIR /opt/venv
RUN uv venv .

# Copy dependency definition files
WORKDIR /app_setup
COPY apps/api/pyproject.toml apps/api/uv.lock ./

# Install dependencies into the virtual environment
# Activate venv and install - this ensures uv uses the venv's python
# Using --no-dev to skip development dependencies
RUN . /opt/venv/bin/activate && \
    uv sync --frozen --no-dev

# Stage 2: Final Stage - Setup runtime environment
FROM python:3.13-slim-bookworm AS final

# Create a non-root user and group
RUN groupadd --system appgroup && \
    useradd --system --gid appgroup --no-create-home --home-dir /app --shell /sbin/nologin appuser

# Copy the virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Create app directory and set ownership
RUN mkdir /app && \
    chown appuser:appgroup /app

WORKDIR /app

# Copy application code from the context (repository root)
# Ensure .dockerignore is present in the apps/api directory (and/or root)
# to exclude unnecessary files like .git, tests, __pycache__, etc.
COPY --chown=appuser:appgroup apps/api /app/api
COPY --chown=appuser:appgroup packages/shared_mcp /app/packages/shared_mcp

# Set user
USER appuser

# Environment variables
# Make Python find modules in /app (if api and packages are structured as top-level packages)
# Also add venv to PATH
ENV PYTHONPATH="/app:${PYTHONPATH}"
ENV PATH="/opt/venv/bin:${PATH}"

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# Using uvicorn directly, assuming it's installed as a dependency in pyproject.toml
# The --root-path=/api is kept from the original Dockerfile's entrypoint.
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--root-path", "/api"]
