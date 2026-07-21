"""
Tacit knowledge interview router — captures expert knowledge.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def start_interview():
    """
    Generate targeted questions for a given equipment based on
    knowledge gaps, capture engineer answers into the knowledge base.
    """
    # TODO: Phase 6 — implement tacit knowledge capture
    return {"status": "not_implemented", "message": "Interview endpoint — coming in Phase 6"}
