"""
RAG query router — answers questions using vector search + graph context.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def query_rag():
    """
    Accept a user question, retrieve relevant chunks from pgvector,
    enrich with graph context from Neo4j, generate answer via Claude.
    """
    # TODO: Phase 3 — implement RAG query pipeline
    return {"status": "not_implemented", "message": "RAG query endpoint — coming in Phase 3"}
