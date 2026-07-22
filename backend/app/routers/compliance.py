"""
Compliance router — checks equipment state against rules.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.services.compliance_engine import evaluate_compliance

router = APIRouter()


@router.get("/{equipment_id}")
async def check_compliance(equipment_id: str, db: Session = Depends(get_db)):
    """
    Compare equipment maintenance state against compliance rules,
    generate reasoning traces for any gaps via Groq.
    """
    result = evaluate_compliance(equipment_id, db)
    return {
        "status": "success",
        "equipment_id": result["equipment_id"],
        "evaluations": result["evaluations"]
    }
