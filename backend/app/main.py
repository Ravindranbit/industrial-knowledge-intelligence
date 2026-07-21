"""
Data Center Cooling Knowledge System — FastAPI Application

Main entrypoint that wires up all routers and initializes
database connections on startup.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ingest, query, compliance, interview, alerts
from app.graph.driver import get_driver, close_driver
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle: open and close DB connections."""
    # Startup: verify Neo4j connectivity
    driver = get_driver()
    driver.verify_connectivity()
    print("✓ Neo4j connection verified")
    yield
    # Shutdown: close connections
    close_driver()
    print("✓ Neo4j connection closed")


app = FastAPI(
    title="Data Center Cooling Knowledge System",
    description="AI-powered knowledge management for data center cooling infrastructure",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(ingest.router, prefix="/ingest", tags=["Ingestion"])
app.include_router(query.router, prefix="/query", tags=["RAG Query"])
app.include_router(compliance.router, prefix="/compliance", tags=["Compliance"])
app.include_router(interview.router, prefix="/interview", tags=["Tacit Knowledge"])
app.include_router(alerts.router, prefix="/alerts", tags=["Proactive Alerts"])


@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "service": "datacenter-knowledge-system"}
