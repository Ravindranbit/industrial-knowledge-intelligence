"""
RAG query router — answers questions using vector search + graph context.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.models.database import get_db
from app.services.retrieval import retrieve_context_and_generate_answer

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/")
async def query_rag(request: QueryRequest, db: Session = Depends(get_db)):
    """
    Accept a user question, retrieve relevant chunks from pgvector,
    enrich with graph context from Neo4j, generate answer via Groq.
    """
    result = retrieve_context_and_generate_answer(request.question, db)
    return {
        "status": "success",
        "question": request.question,
        "answer": result["answer"],
        "confidence_tier": result["confidence_tier"],
        "sources": result["context_sources"]
    }
