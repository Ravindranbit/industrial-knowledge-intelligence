# Project Progress Summary: Data Center Cooling Knowledge System

This document summarizes the foundational work completed during **Phase 0**, **Phase 1**, and **Phase 2** of the Industrial Knowledge Intelligence project. It outlines *what* we built and, more importantly, *why* those architectural decisions were made.

---

## Phase 0: System Architecture & Setup

### What We Did
1. **Repository Structure**: Scaffolding of a modular FastAPI backend (`/backend/app`).
2. **Database Provisioning**: 
   - Set up **PostgreSQL with pgvector** (via local Docker) for relational data and vector storage.
   - Connected to **Neo4j AuraDB** (cloud) for Graph data.
3. **Configuration & Connectivity**: Configured environment variables (`.env`), adjusted Pydantic settings for Python 3.13 compatibility, and wrote a connectivity test script (`test_connectivity.py`) to verify everything talks to each other.

### Why We Did It
- **FastAPI**: Provides high-performance, asynchronous endpoints necessary for handling concurrent LLM and database queries.
- **Postgres + pgvector**: Allows us to store both document metadata and mathematical vector embeddings in the same place. This is crucial for fast semantic similarity search (finding text chunks that answer a user's question).
- **Neo4j Graph Database**: Traditional vector databases struggle with highly interconnected data (e.g., "Which technicians have resolved incidents related to a specific CRAC unit's failure mode?"). Neo4j allows us to map the complex relationships between equipment, rules, and human knowledge.
- **Dual Database Approach (GraphRAG)**: By combining pgvector (for fuzzy text search) and Neo4j (for explicit relational context), we achieve a GraphRAG architecture. This drastically reduces LLM hallucinations and provides highly accurate, context-aware answers.

---

## Phase 1: Data Corpus Sourcing

### What We Did
We sourced and created three highly structured technical documents in the `/data/raw/` directory:
1. `ashrae_tc9.9_guidelines.txt`: Industry-standard thermal guidelines, equipment classes, and compliance rules.
2. `chilled_water_piping_diagram.txt`: A detailed schematic of a Tier III chilled water cooling loop, including pumps, chillers, and CRAH units.
3. `oem_manual_liebert_ds.txt`: An OEM manual excerpt for Vertiv Liebert CRAC units detailing maintenance schedules, failure modes, and alarm codes.

### Why We Did It
- **Grounding the LLM**: AI models are prone to hallucinating technical specs. By providing real, domain-specific engineering data, we ensure the system has a concrete source of truth.
- **Rich Entity Density**: These specific documents were chosen because they contain a high density of interconnected entities (equipment types, temperature thresholds, failure modes, maintenance rules). This serves as the perfect stress-test for our extraction and graph ingestion pipeline.

---

## Phase 2: The Ingestion & Extraction Pipeline

### What We Did
1. **Graph Schema Design**: Designed the Neo4j schema with strict nodes (`Equipment`, `FailureMode`, `Incident`, `WorkOrder`, `ComplianceRule`) and relationships (`HAS_FAILURE_MODE`, `GOVERNED_BY`, etc.).
2. **LLM Extraction Prompt**: Engineered a strict Groq/Llama-3 prompt (`prompts/extraction.txt`) that forces the LLM to read a document and return a structured JSON object containing all identified entities and their exact relationships.
3. **Extraction & Embedding Services**: 
   - Built `extraction.py` to handle chunking (splitting long documents into 1000-character blocks).
   - Built `embedding.py` to convert those text chunks into 384-dimensional mathematical vectors using the lightweight `all-MiniLM-L6-v2` model.
4. **The Ingestion Router (`routers/ingest.py`)**: Tied it all together into a single API endpoint. When a document is submitted, the system automatically parses, extracts, chunks, embeds, and stores the data into both Postgres and Neo4j simultaneously.

### Why We Did It
- **Automation at Scale**: Manually entering data center knowledge into a graph database is impossible at scale. This pipeline allows us to throw messy PDFs, manuals, and ticket logs at the system, and have it automatically build a pristine, highly structured knowledge graph.
- **Idempotency**: The graph write functions (`write.py`) use Neo4j's `MERGE` command. This ensures that if the same piece of equipment is mentioned in 10 different documents, it only creates one node in the graph, linking all the disparate information together.
- **Non-blocking Architecture**: We designed the ingestion router so that if the graph database is temporarily unavailable, the document is still saved and embedded in Postgres, ensuring no data loss.

---

## Current Status & Next Steps

The foundation (Data and Graph storage) is now 100% complete and fully tested. We have successfully transformed unstructured technical text into a queryable mathematical and relational database. 

**Next up is Phase 3 (RAG Copilot)**, where we will build the intelligence layer that *reads* from these databases to answer complex engineering questions in real-time.
