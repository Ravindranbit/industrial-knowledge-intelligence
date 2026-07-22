"""
Proactive pattern-match service.
"""

import json
from pathlib import Path
from groq import Groq

from app.config import settings
from app.graph.read import get_equipment_history, get_equipment_context

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"
_PATTERN_PROMPT = (_PROMPT_DIR / "pattern_match_prompt.txt").read_text(encoding="utf-8")

# In-memory store for demo alerts (a real app would use a DB table)
ALERTS_STORE = []

def _get_client() -> Groq:
    return Groq(api_key=settings.GROQ_API_KEY)


def check_for_patterns(equipment_id: str, new_doc_summary: str) -> dict:
    """
    Check if a new document for equipment_id matches any past failure patterns.
    If it does, append an alert to the ALERTS_STORE.
    """
    history = get_equipment_history(equipment_id)
    context = get_equipment_context(equipment_id)
    
    # If there is no past history or failure modes, we can't pattern match
    if not history.get("incidents") and not context.get("failure_modes"):
        return {"status": "skipped", "reason": "no_past_knowledge"}
        
    past_knowledge = json.dumps({
        "incidents": history.get("incidents", []),
        "failure_modes": context.get("failure_modes", [])
    }, indent=2)
    
    prompt = _PATTERN_PROMPT.format(
        new_document_summary=new_doc_summary,
        equipment_id=equipment_id,
        past_knowledge=past_knowledge
    )
    
    client = _get_client()
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Output ONLY a valid JSON object."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        raw = response.choices[0].message.content.strip()
        parsed = json.loads(raw)
        
        if parsed.get("is_match"):
            alert = {
                "equipment_id": equipment_id,
                "message": parsed.get("alert_message", "Possible recurring issue detected."),
                "trigger_summary": new_doc_summary
            }
            ALERTS_STORE.append(alert)
            return {"status": "match_found", "alert": alert}
            
        return {"status": "no_match"}
        
    except Exception as e:
        print(f"Error in pattern matching: {e}")
        return {"status": "error", "message": str(e)}

def get_recent_alerts():
    return ALERTS_STORE[-20:] # Return last 20 alerts
