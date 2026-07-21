"""
Ingestion router — accepts documents and triggers extraction pipeline.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def ingest_document():
    """
    Accept a document upload, extract entities via Claude,
    store chunks + embeddings in Postgres, write entities to Neo4j.
    """
    # TODO: Phase 2 — implement full ingestion pipeline
    return {"status": "not_implemented", "message": "Ingestion endpoint — coming in Phase 2"}
