"""
Application configuration — loads settings from environment variables.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """All configuration loaded from .env or environment variables."""

    # --- Neo4j ---
    NEO4J_URI: str = "neo4j+s://xxxxxxxx.databases.neo4j.io"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = ""

    # --- Postgres + pgvector ---
    POSTGRES_URL: str = "postgresql://user:password@localhost:5432/datacenter_kb"

    # --- Claude API ---
    ANTHROPIC_API_KEY: str = ""

    # --- CORS ---
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # --- App ---
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
