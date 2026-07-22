"""
Ingestion router — accepts documents and runs the full extraction pipeline:
1. Receive document (text upload or file)
2. Extract entities via Groq LLM
3. Chunk text and generate embeddings
4. Store document + chunks in Postgres (pgvector)
5. Write extracted entities to Neo4j graph
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.models.database import get_db, Document, Chunk
from app.services.extraction import extract_entities, chunk_text
from app.services.embedding import embed_texts
from app.graph.driver import get_session as get_neo4j_session
from app.graph import write as graph_write
from app.services.pattern_match import check_for_patterns

router = APIRouter()


def _write_entities_to_graph(extraction_result: dict):
    """Write extracted entities and relationships to Neo4j."""
    entities = extraction_result.get("entities", {})

    with get_neo4j_session() as session:
        # --- Create nodes ---
        for eq in entities.get("equipment", []):
            session.execute_write(
                graph_write.create_equipment,
                name=eq["name"],
                eq_type=eq.get("type", "unknown"),
                location=eq.get("location", ""),
                manufacturer=eq.get("manufacturer", ""),
                model=eq.get("model", ""),
            )

        for fm in entities.get("failure_modes", []):
            session.execute_write(
                graph_write.create_failure_mode,
                name=fm["name"],
                description=fm.get("description", ""),
                severity=fm.get("severity", ""),
                common_causes=fm.get("common_causes", ""),
            )

        for inc in entities.get("incidents", []):
            session.execute_write(
                graph_write.create_incident,
                incident_id=inc["incident_id"],
                date=inc.get("date", ""),
                description=inc.get("description", ""),
                severity=inc.get("severity", ""),
                resolution=inc.get("resolution", ""),
            )

        for wo in entities.get("work_orders", []):
            session.execute_write(
                graph_write.create_work_order,
                order_id=wo["order_id"],
                wo_type=wo.get("type", ""),
                completed_date=wo.get("completed_date", ""),
                description=wo.get("description", ""),
            )

        for tech in entities.get("technicians", []):
            session.execute_write(
                graph_write.create_technician,
                name=tech["name"],
                role=tech.get("role", "technician"),
            )

        # --- Create relationships ---
        for rel in extraction_result.get("relationships", []):
            rel_type = rel.get("relationship", "")
            from_id = rel.get("from_id", "")
            to_id = rel.get("to_id", "")

            if rel_type == "INVOLVES":
                session.execute_write(
                    graph_write.link_incident_to_equipment,
                    incident_id=from_id,
                    equipment_name=to_id,
                )
            elif rel_type == "MATCHES_PATTERN":
                session.execute_write(
                    graph_write.link_incident_to_failure_mode,
                    incident_id=from_id,
                    failure_mode_name=to_id,
                )
            elif rel_type == "HAS_FAILURE_MODE":
                session.execute_write(
                    graph_write.link_equipment_to_failure_mode,
                    equipment_name=from_id,
                    failure_mode_name=to_id,
                )
            elif rel_type == "RESOLVED_BY":
                session.execute_write(
                    graph_write.link_work_order_to_technician,
                    order_id=from_id,
                    technician_name=to_id,
                )
            elif rel_type == "ADDRESSES":
                session.execute_write(
                    graph_write.link_work_order_to_incident,
                    order_id=from_id,
                    incident_id=to_id,
                )


@router.post("/")
async def ingest_document(
    title: str = Form(...),
    doc_type: str = Form("manual"),
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Ingest a document through the full pipeline:
    1. Parse text from upload or form field
    2. Extract entities via Groq LLM
    3. Chunk and embed text
    4. Store in Postgres + Neo4j
    """
    # --- 1. Get document text ---
    if text:
        doc_text = text
    elif file:
        content = await file.read()
        doc_text = content.decode("utf-8", errors="replace")
    else:
        raise HTTPException(status_code=400, detail="Provide either 'text' or 'file'")

    if len(doc_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Document text too short (min 50 chars)")

    # --- 2. Extract entities via LLM ---
    try:
        extraction_result = extract_entities(doc_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity extraction failed: {str(e)}")

    # --- 3. Chunk text and generate embeddings ---
    chunks_data = chunk_text(doc_text)
    chunk_texts = [c["content"] for c in chunks_data]

    try:
        embeddings = embed_texts(chunk_texts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

    # --- 4. Store document + chunks in Postgres ---
    doc = Document(
        title=title,
        doc_type=doc_type,
        source_path=file.filename if file else None,
        metadata_={
            "summary": extraction_result.get("document_summary", ""),
            "entity_counts": {
                k: len(v) for k, v in extraction_result.get("entities", {}).items()
            },
        },
    )
    db.add(doc)
    db.flush()  # Get the auto-generated doc.id

    for chunk_data, embedding in zip(chunks_data, embeddings):
        chunk = Chunk(
            document_id=doc.id,
            content=chunk_data["content"],
            embedding=embedding,
            chunk_index=chunk_data["chunk_index"],
            metadata_={
                "char_start": chunk_data["char_start"],
                "char_end": chunk_data["char_end"],
            },
        )
        db.add(chunk)

    db.commit()

    # --- 5. Write entities to Neo4j graph ---
    graph_status = "skipped"
    try:
        _write_entities_to_graph(extraction_result)
        graph_status = "success"
    except Exception as e:
        # Don't fail the whole request if Neo4j is down
        graph_status = f"failed: {str(e)}"

    # --- 6. Proactive Pattern Match ---
    # Trigger pattern matching for each extracted equipment
    pattern_results = []
    summary = extraction_result.get("document_summary", "")
    for eq in extraction_result.get("entities", {}).get("equipment", []):
        eq_name = eq.get("name")
        if eq_name and summary:
            # Send to background or run synchronously. For simplicity, run sync.
            res = check_for_patterns(eq_name, summary)
            if res.get("status") == "match_found":
                pattern_results.append(res["alert"])
    
    # --- Build response ---
    entity_counts = {
        k: len(v) for k, v in extraction_result.get("entities", {}).items()
    }
    relationship_count = len(extraction_result.get("relationships", []))

    return {
        "status": "success",
        "document_id": doc.id,
        "title": title,
        "doc_type": doc_type,
        "chunks_stored": len(chunks_data),
        "entities_extracted": entity_counts,
        "relationships_extracted": relationship_count,
        "graph_status": graph_status,
        "summary": summary,
        "alerts_generated": len(pattern_results)
    }


@router.post("/text")
async def ingest_raw_text(
    title: str = Form(...),
    doc_type: str = Form("manual"),
    text: str = Form(...),
    db: Session = Depends(get_db),
):
    """Convenience endpoint — ingest plain text directly (no file upload)."""
    return await ingest_document(title=title, doc_type=doc_type, text=text, file=None, db=db)
