# Makefile for AI Agent Canvas & Playground

.PHONY: help build up down logs ps clean prune env-db env-api

# Default target: Show help
default: help

# Variables
COMPOSE_FILE = docker-compose.yml

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  help       Show this help message."
	@echo "  env-db     Create .env.db from example if it doesn't exist."
	@echo "  env-api    Create apps/api/.env from example if it doesn't exist."
	@echo "  build      Build or rebuild services."
	@echo "  up         Create and start containers in detached mode."
	@echo "  down       Stop and remove containers, networks."
	@echo "  logs       Follow log output."
	@echo "  ps         List containers."
	@echo "  clean      Remove stopped containers and dangling images."
	@echo "  prune      Remove all unused containers, networks, images (both dangling and unreferenced), and volumes."

# Environment File Setup
env-db:
	@if [ ! -f .env.db ]; then \
		_cp .env.db.example .env.db; \
		_echo "Created .env.db from example. Please review and update if necessary."; \
	else \
		_echo ".env.db already exists."; \
	fi

env-api:
	@if [ ! -f apps/api/.env ]; then \
		_cp apps/api/.env.example apps/api/.env; \
		_echo "Created apps/api/.env from example. Please review and update API keys and other settings."; \
	else \
		_echo "apps/api/.env already exists."; \
	fi

# Docker Compose Commands
build:
	@echo "Building services..."
	@docker compose -f $(COMPOSE_FILE) build

up: env-db env-api
	@echo "Starting services in detached mode..."
	@docker compose -f $(COMPOSE_FILE) up -d

down:
	@echo "Stopping and removing services..."
	@docker compose -f $(COMPOSE_FILE) down

logs:
	@echo "Following logs... (Press Ctrl+C to stop)"
	@docker compose -f $(COMPOSE_FILE) logs -f

ps:
	@echo "Listing running services..."
	@docker compose -f $(COMPOSE_FILE) ps

# Docker System Commands
clean:
	@echo "Removing stopped containers and dangling images..."
	@docker container prune -f
	@docker image prune -f

prune: down
	@echo "WARNING: This will remove all unused containers, networks, images, and volumes!"
	@read -p "Are you sure you want to continue? (y/N) " -n 1 -r; \
	_echo; \
	_if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		_echo "Pruning Docker system..."; \
		_docker system prune -a --volumes -f; \
	else \
		_echo "Prune cancelled."; \
	fi

# Helper alias for echo to avoid issues with shell interpretation
_echo := echo
_cp := cp
_if := if

