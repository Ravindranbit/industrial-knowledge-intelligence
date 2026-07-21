"""
Compliance router — checks equipment state against rules.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def check_compliance():
    """
    Compare equipment maintenance state against compliance rules,
    generate reasoning traces for any gaps via Claude.
    """
    # TODO: Phase 5 — implement compliance engine
    return {"status": "not_implemented", "message": "Compliance endpoint — coming in Phase 5"}
