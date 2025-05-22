from pydantic import PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="/opt/.env",
        env_ignore_empty=True,
        extra="ignore",
    )

    model: str = "gpt-4o-mini-2024-07-18"
    openai_api_key: str = ""
    mcp_server_port: int = 8050

    postgres_dsn: PostgresDsn = (
        "postgresql://postgres:password@example.supabase.com:6543/postgres"
    )

    # Neo4j Connection Details
    neo4j_uri: str = "neo4j://neo4j:7687"  # Default for local Docker setup
    neo4j_username: str = "neo4j"
    neo4j_password: str = ""  # Will be loaded from environment variables

    # Neo4j environment variables
    model_config = SettingsConfigDict(
        env_file=".env.db",
        env_prefix="NEO4J_",
        env_ignore_empty=True,
        extra="ignore",
    )

    @computed_field
    @property
    def orm_conn_str(self) -> str:
        # NOTE: Explicitly follow LangGraph AsyncPostgresSaver
        # and use psycopg driver for ORM
        return self.postgres_dsn.encoded_string().replace(
            "postgresql://", "postgresql+psycopg://"
        )

    @computed_field
    @property
    def checkpoint_conn_str(self) -> str:
        # NOTE: LangGraph AsyncPostgresSaver has some issues
        # with specifying psycopg driver explicitly
        return self.postgres_dsn.encoded_string()


settings = Settings()
