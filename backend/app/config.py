"""
Application configuration — loads settings from environment variables.
"""

from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

# Resolve .env from project root (two levels up from this file: app/ -> backend/ -> project root)
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    """All configuration loaded from .env or environment variables."""

    # --- Neo4j ---
    NEO4J_URI: str = "neo4j+s://xxxxxxxx.databases.neo4j.io"
    NEO4J_USERNAME: str = "neo4j"
    NEO4J_PASSWORD: str = ""
    NEO4J_DATABASE: str = ""

    # --- Postgres + pgvector ---
    POSTGRES_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/datacenter_kb"

    # --- Groq API ---
    GROQ_API_KEY: str = ""

    # --- CORS ---
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # --- App ---
    DEBUG: bool = True

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

