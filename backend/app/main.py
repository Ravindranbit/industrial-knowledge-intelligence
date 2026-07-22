"""
Data Center Cooling Knowledge System — FastAPI Application

Main entrypoint that wires up all routers and initializes
database connections on startup.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ingest, query, compliance, interview, alerts, dashboard_summary
from app.graph.driver import get_driver, close_driver
from app.models.database import init_db
from app.config import settings



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle: open and close DB connections."""
    # Startup: initialize Postgres tables
    try:
        init_db()
    except Exception as e:
        print(f"Warning: Postgres init failed (is Docker running?): {e}")

    # Startup: verify Neo4j connectivity
    try:
        driver = get_driver()
        driver.verify_connectivity()
        print("Success: Neo4j connection verified")
    except Exception as e:
        print(f"Warning: Neo4j connection failed (continuing without graph): {e}")

    yield

    # Shutdown: close connections
    close_driver()
    print("Success: Connections closed")


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
app.include_router(dashboard_summary.router, prefix="/dashboard-summary", tags=["Dashboard Summary"])



@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "service": "datacenter-knowledge-system"}
