"""
Compliance engine service — compares equipment state against rules.
"""

import json
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import select
from groq import Groq

from app.config import settings
from app.models.database import ComplianceRule
from app.graph.read import get_equipment_history, get_equipment_context

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"
_COMPLIANCE_PROMPT = (_PROMPT_DIR / "compliance_reasoning_prompt.txt").read_text(encoding="utf-8")


def _get_client() -> Groq:
    """Return a Groq API client."""
    return Groq(api_key=settings.GROQ_API_KEY)


def evaluate_compliance(equipment_id: str, db: Session) -> dict:
    """
    1. Fetch equipment state from Neo4j.
    2. Fetch applicable compliance rules from Postgres.
    3. Use Groq to evaluate each rule against the state.
    """
    history = get_equipment_history(equipment_id)
    context = get_equipment_context(equipment_id)
    
    # We could filter rules by applies_to_equipment_type from the DB,
    # but for simplicity, we will just fetch all rules if they are small in number.
    rules = db.execute(select(ComplianceRule)).scalars().all()
    
    equipment_state_str = json.dumps({
        "incidents": history.get("incidents", []),
        "work_orders": history.get("work_orders", [])
    }, indent=2)
    
    results = []
    client = _get_client()
    
    for rule in rules:
        prompt = _COMPLIANCE_PROMPT.format(
            clause=rule.clause_ref,
            description=rule.description,
            requirement=rule.requirement_text,
            interval=rule.interval_days,
            equipment_state=equipment_state_str
        )
        
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant", # Can use smaller model for this logic task
                messages=[
                    {"role": "system", "content": "You are a compliance reasoning engine. Output ONLY a valid JSON object."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()
            parsed = json.loads(raw)
            
            results.append({
                "rule": {
                    "clause_ref": rule.clause_ref,
                    "description": rule.description
                },
                "is_gap": parsed.get("is_gap", False),
                "reasoning_trace": parsed.get("reasoning_trace", "Failed to parse reasoning trace.")
            })
        except Exception as e:
            results.append({
                "rule": {
                    "clause_ref": rule.clause_ref,
                    "description": rule.description
                },
                "is_gap": True,
                "reasoning_trace": f"Error during evaluation: {e}"
            })
            
    return {
        "equipment_id": equipment_id,
        "evaluations": results
    }
