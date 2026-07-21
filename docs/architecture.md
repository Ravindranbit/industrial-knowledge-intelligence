# Architecture

> This document will be filled in as the system is built. See `datacenter_implementation_plan.md` in the project root for the planned architecture.

## Components

- **Backend**: FastAPI (Python) — REST API with routers for ingestion, RAG query, compliance, interviews, and alerts
- **Graph DB**: Neo4j AuraDB — stores equipment, failure modes, incidents, work orders, compliance rules, and tacit knowledge as a connected graph
- **Vector DB**: Postgres + pgvector — stores document chunks and embeddings for similarity search
- **LLM**: Claude API — powers entity extraction, RAG answer generation, compliance reasoning, and interview question generation
- **Frontend**: Next.js — four views: chat, compliance dashboard, tacit knowledge interview, and proactive alert feed
