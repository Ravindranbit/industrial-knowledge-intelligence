"""
Retrieval service — pgvector + graph retrieval for RAG.
"""

import json
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.orm import Session
from groq import Groq

from app.config import settings
from app.models.database import Chunk, Document
from app.services.embedding import embed_text
from app.graph.read import get_equipment_history, get_equipment_context
from app.services.confidence import evaluate_confidence

# Load prompt template
_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"
_RAG_PROMPT = (_PROMPT_DIR / "rag_answer_prompt.txt").read_text(encoding="utf-8")


def _get_client() -> Groq:
    """Return a Groq API client."""
    return Groq(api_key=settings.GROQ_API_KEY)


def _extract_equipment_from_query(question: str) -> list[str]:
    """
    Use a fast, small LLM call to extract any equipment IDs mentioned in the query.
    This is needed to know which Neo4j nodes to pull context for.
    """
    client = _get_client()
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are an entity extractor. Extract any equipment IDs (like CRAC-1, CRAC-3, CH-2) from the user's question. Return ONLY a JSON list of strings, e.g. [\"CRAC-3\"]. If none found, return []."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        temperature=0,
        response_format={"type": "json_object"}
    )
    raw = response.choices[0].message.content
    try:
        # The prompt asks for a list, but response_format={"type": "json_object"} requires a dict.
        # Let's handle if it returns {"equipment": ["CRAC-3"]}
        data = json.loads(raw)
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, list):
                    return v
        return []
    except Exception:
        return []


def retrieve_context_and_generate_answer(question: str, db: Session) -> dict:
    """
    1. Embed question.
    2. Retrieve top chunks from pgvector.
    3. Extract equipment IDs from question.
    4. Fetch graph context for those IDs.
    5. Pass everything to Groq to generate the final RAG answer.
    """
    # 1. Embed question
    query_embedding = embed_text(question)

    # 2. Retrieve vector chunks (Top 5) and their distances
    distance_col = Chunk.embedding.cosine_distance(query_embedding).label("distance")
    stmt = (
        select(Chunk, Document, distance_col)
        .join(Document, Chunk.document_id == Document.id)
        .order_by(distance_col)
        .limit(5)
    )
    results = db.execute(stmt).all()
    
    vector_context = []
    min_distance = None
    for chunk, doc, distance in results:
        if min_distance is None or distance < min_distance:
            min_distance = distance
        vector_context.append(f"--- Source: [{doc.title}] ---\n{chunk.content}\n")
    
    # 3 & 4. Fetch Graph Context
    equipment_ids = _extract_equipment_from_query(question)
    graph_context = []
    for eq_id in equipment_ids:
        try:
            history = get_equipment_history(eq_id)
            context = get_equipment_context(eq_id)
            
            graph_context.append(f"--- Graph Data for {eq_id} ---")
            graph_context.append(f"Properties: {json.dumps(context.get('equipment', {}))}")
            graph_context.append(f"Known Failure Modes: {json.dumps(context.get('failure_modes', []))}")
            graph_context.append(f"Past Incidents: {json.dumps(history.get('incidents', []))}")
            graph_context.append(f"Past Work Orders: {json.dumps(history.get('work_orders', []))}")
            graph_context.append(f"Compliance Rules: {json.dumps(context.get('compliance_rules', []))}\n")
        except Exception as e:
            print(f"Graph lookup failed for {eq_id}: {e}")
            pass
            
    # Combine context
    full_context = "--- Vector Store Documents ---\n" + "\n".join(vector_context)
    if graph_context:
        full_context += "\n--- Neo4j Graph Data ---\n" + "\n".join(graph_context)

    # 5. Generate Answer via LLM
    client = _get_client()
    prompt = _RAG_PROMPT.format(context=full_context, question=question)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful assistant. Output ONLY a valid JSON object."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        response_format={"type": "json_object"}
    )
    
    raw = response.choices[0].message.content.strip()
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {"answer": raw, "confidence_tier": "No reliable source / escalate"}
        
    parsed = evaluate_confidence(parsed, min_distance)
    
    return {
        "answer": parsed.get("answer", "Error generating answer."),
        "confidence_tier": parsed.get("confidence_tier"),
        "context_sources": [doc.title for chunk, doc, dist in results]
    }
