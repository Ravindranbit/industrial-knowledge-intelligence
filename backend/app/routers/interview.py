"""
Tacit knowledge interview router — captures expert knowledge.
"""

import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from groq import Groq

from app.config import settings
from app.models.database import get_db, Document, Chunk
from app.graph.read import get_equipment_history, get_equipment_context
from app.graph.driver import get_session as get_neo4j_session
from app.services.embedding import embed_texts

router = APIRouter()

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"
_INTERVIEW_PROMPT = (_PROMPT_DIR / "interview_question_prompt.txt").read_text(encoding="utf-8")


class InterviewAnswers(BaseModel):
    technician_name: str
    answers: dict[str, str] # mapping of question to answer

def _get_client() -> Groq:
    """Return a Groq API client."""
    return Groq(api_key=settings.GROQ_API_KEY)


@router.get("/{equipment_id}/questions")
async def generate_questions(equipment_id: str):
    """
    Generate targeted questions for a given equipment based on graph gaps.
    """
    history = get_equipment_history(equipment_id)
    context = get_equipment_context(equipment_id)
    
    documented_knowledge = json.dumps({
        "incidents": history.get("incidents", []),
        "work_orders": history.get("work_orders", []),
        "failure_modes": context.get("failure_modes", [])
    }, indent=2)
    
    client = _get_client()
    prompt = _INTERVIEW_PROMPT.format(
        equipment_id=equipment_id,
        documented_knowledge=documented_knowledge
    )
    
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Output ONLY a valid JSON list of strings."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    raw = response.choices[0].message.content.strip()
    try:
        data = json.loads(raw)
        questions = []
        if isinstance(data, list):
            questions = data
        elif isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, list):
                    questions = v
                    break
        return {"equipment_id": equipment_id, "questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {e}")


@router.post("/{equipment_id}/answers")
async def save_answers(equipment_id: str, payload: InterviewAnswers, db: Session = Depends(get_db)):
    """
    Store engineer's answers as embeddings (Postgres) + graph nodes (Neo4j).
    """
    # 1. Format text for vector storage
    full_text = f"Tacit Knowledge Interview for {equipment_id} by {payload.technician_name}.\n\n"
    for q, a in payload.answers.items():
        full_text += f"Q: {q}\nA: {a}\n\n"
        
    doc = Document(
        title=f"Interview: {payload.technician_name} on {equipment_id}",
        doc_type="interview",
        metadata_={"equipment_id": equipment_id, "technician": payload.technician_name}
    )
    db.add(doc)
    db.flush()
    
    # We will treat each Q&A pair as a separate chunk
    chunk_texts = []
    chunks_data = []
    idx = 0
    for q, a in payload.answers.items():
        chunk_content = f"Equipment: {equipment_id}\nQ: {q}\nA: {a}"
        chunk_texts.append(chunk_content)
        chunks_data.append({"content": chunk_content, "index": idx})
        idx += 1
        
    embeddings = embed_texts(chunk_texts)
    
    for c_data, emb in zip(chunks_data, embeddings):
        chunk = Chunk(
            document_id=doc.id,
            content=c_data["content"],
            embedding=emb,
            chunk_index=c_data["index"]
        )
        db.add(chunk)
        
    db.commit()
    
    # 2. Write to Neo4j
    with get_neo4j_session() as session:
        # Create TacitKnowledge node and relationships
        query = """
        MERGE (e:Equipment {name: $equipment_name})
        MERGE (t:Technician {name: $technician_name})
        CREATE (tk:TacitKnowledge {
            document_id: $doc_id,
            content: $content
        })
        CREATE (tk)-[:ABOUT]->(e)
        CREATE (tk)-[:CONTRIBUTED_BY]->(t)
        """
        try:
            session.run(
                query, 
                equipment_name=equipment_id,
                technician_name=payload.technician_name,
                doc_id=doc.id,
                content=full_text
            )
        except Exception as e:
            print(f"Warning: Failed to write TacitKnowledge to Neo4j: {e}")
            
    return {"status": "success", "document_id": doc.id}
