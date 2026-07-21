# Implementation Plan — Data Center Cooling Knowledge System

This document gives you the concrete build plan: system architecture, data flow, and a phase-by-phase implementation plan with actual tasks, schemas, and file structure — ready to start coding against.

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                        │
│                                                                    │
│   ┌───────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────┐ │
│   │ RAG Chat  │  │  Compliance  │  │  Tacit KB  │  │ Proactive │ │
│   │ Interface │  │  Dashboard   │  │  Interview │  │ Alert Feed│ │
│   └─────┬─────┘  └──────┬───────┘  └─────┬──────┘  └─────┬─────┘ │
└─────────┼───────────────┼────────────────┼───────────────┼───────┘
          │               │                │               │
          └───────────────┴────────────────┴───────────────┘
                              │ REST API (JSON)
          ┌───────────────────▼────────────────────┐
          │        BACKEND (FastAPI, Python)        │
          │                                         │
          │  /ingest      /query      /compliance   │
          │  /interview   /alerts     /graph         │
          └──┬──────────┬────────────┬───────────┬───┘
             │          │            │           │
    ┌────────▼───┐ ┌────▼──────┐ ┌───▼───────┐ ┌─▼──────────────┐
    │ Ingestion &│ │ Retrieval  │ │ Compliance│ │ Proactive      │
    │ Extraction │ │ (RAG)      │ │ Engine    │ │ Pattern Match  │
    │ Service    │ │ Service    │ │ Service   │ │ Service        │
    └─────┬──────┘ └─────┬──────┘ └─────┬─────┘ └───────┬────────┘
          │              │              │               │
          └──────────────┴──────────────┴───────────────┘
                              │
          ┌───────────────────┼────────────────────┐
          │                   │                    │
    ┌─────▼──────┐    ┌───────▼────────┐   ┌───────▼────────┐
    │ Postgres + │    │  Neo4j (graph  │   │  Claude API     │
    │ pgvector   │    │  database)     │   │  (all LLM calls)│
    │ (chunks,   │    │  equipment ↔   │   │                 │
    │ embeddings)│    │  failure ↔     │   │                 │
    │            │    │  incident ↔    │   │                 │
    │            │    │  compliance    │   │                 │
    └────────────┘    └────────────────┘   └─────────────────┘
```

**Why this shape:** each service (ingestion, RAG, compliance, proactive) is a separate module that reads/writes the same two databases — the vector store for raw text search, the graph for relationships. This lets three people build independently without stepping on each other's code.

---

## 2. Data Flow (What Happens, Step by Step)

**A. When a new document is uploaded:**
```
Document (PDF/text) 
   → Extraction service sends it to Claude API with a structured-extraction prompt
   → Claude returns entities (equipment, failure mode, date, technician, etc.) as JSON
   → Entities are (1) embedded and stored in Postgres/pgvector, 
                  (2) written as nodes/edges into Neo4j
   → Proactive service immediately checks new entities against existing graph patterns
   → If a match is found → alert is created and pushed to the frontend alert feed
```

**B. When a technician asks a question (RAG flow):**
```
User question 
   → Backend embeds the question
   → pgvector similarity search retrieves relevant document chunks
   → Neo4j is queried for related graph facts (equipment history, linked incidents)
   → Both are passed to Claude API with a prompt: "answer using ONLY this context, 
     cite sources, and rate your confidence"
   → Claude returns answer + citations + confidence tier
   → Frontend displays answer with citation links and a confidence badge
```

**C. When compliance is checked:**
```
Scheduled or on-demand trigger
   → Compliance service pulls equipment maintenance state from Neo4j
   → Compares against stored rules (e.g., "coil cleaning every 3 months")
   → For each gap: Claude API generates a reasoning trace 
     ("Rule X requires Y, equipment state shows Z, last cleaned N months ago → gap")
   → Result stored and shown on the dashboard with the full trace, not just a flag
```

**D. When a senior engineer does a knowledge-capture interview:**
```
Engineer opens "Tacit Knowledge" flow, selects equipment (e.g., CRAC-3)
   → Claude API generates targeted questions based on what's already in the graph 
     (i.e., asks about gaps, not things already documented)
   → Engineer answers in free text
   → Answers are embedded + stored in pgvector, AND written into Neo4j 
     as nodes linked to that equipment — same status as a manual excerpt
```

---

## 3. Data Model (Core Schema)

**Postgres tables:**
```sql
documents (
  id, title, doc_type,      -- 'manual' | 'ticket' | 'inspection' | 'incident' | 'interview'
  source_path, uploaded_at
)

chunks (
  id, document_id (FK), content, embedding (vector),
  page_number, metadata (jsonb)
)

compliance_rules (
  id, clause_ref, description, requirement_text,
  applies_to_equipment_type, interval_days
)
```

**Neo4j graph (nodes and relationships):**
```
Nodes: Equipment, FailureMode, Incident, WorkOrder, ComplianceRule, Technician, TacitKnowledge

Relationships:
(Equipment)-[:HAS_FAILURE_MODE]->(FailureMode)
(Incident)-[:INVOLVES]->(Equipment)
(Incident)-[:MATCHES_PATTERN]->(FailureMode)
(WorkOrder)-[:RESOLVED_BY]->(Technician)
(WorkOrder)-[:ADDRESSES]->(Incident)
(Equipment)-[:GOVERNED_BY]->(ComplianceRule)
(TacitKnowledge)-[:ABOUT]->(Equipment)
(TacitKnowledge)-[:CONTRIBUTED_BY]->(Technician)
```

This schema is deliberately small — five to seven node types is enough to demo every feature without over-engineering the graph.

---

## 4. Suggested Folder Structure

```
project-root/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entrypoint
│   │   ├── routers/
│   │   │   ├── ingest.py
│   │   │   ├── query.py            # RAG endpoint
│   │   │   ├── compliance.py
│   │   │   ├── interview.py        # tacit knowledge capture
│   │   │   └── alerts.py           # proactive push
│   │   ├── services/
│   │   │   ├── extraction.py       # Claude-based entity extraction
│   │   │   ├── retrieval.py        # pgvector + graph retrieval
│   │   │   ├── confidence.py       # confidence tiering logic
│   │   │   ├── compliance_engine.py
│   │   │   └── pattern_match.py    # proactive push logic
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── graph/                  # Neo4j driver + queries
│   │   └── prompts/                # all Claude prompt templates, kept separate
│   └── requirements.txt
├── frontend/
│   ├── pages/ or app/
│   │   ├── chat.tsx
│   │   ├── compliance.tsx
│   │   ├── interview.tsx
│   │   └── alerts.tsx
│   └── package.json
├── data/
│   ├── raw/                        # sourced real docs (diagram, manual excerpt, ASHRAE text)
│   ├── synthetic/                  # generated tickets, PM reports, incident logs
│   └── eval/                       # ground-truth entity labels + Q&A pairs
└── docs/
    ├── architecture.md
    └── known_limitations.md
```

Keeping prompt templates in their own folder (not inline in code) makes it much faster to iterate on extraction/RAG quality without touching application logic — worth doing from day one.

---

## 5. Implementation Plan (Phase by Phase)

### Phase 0 — Setup (half day)
- Repo created, folder structure above scaffolded
- Postgres + pgvector running (Docker or Railway/Render managed instance)
- Neo4j running (Neo4j AuraDB free tier is easiest — no local install needed)
- Claude API key wired into backend, one test call working end-to-end
- Role split confirmed (see below)

### Phase 1 — Data corpus (Day 1–2)
- Collect: 1 real CRAC/chiller piping diagram, 1 real OEM manual excerpt, real ASHRAE TC9.9 text
- Generate: 15–30 synthetic maintenance tickets, 10–15 PM reports, 5–10 incident logs
- Write: 15–20 ground-truth entity labels, 15–20 Q&A pairs — this defines "done" for later phases

### Phase 2 — Ingestion + extraction (Day 2–3)
- Build `/ingest` endpoint: accepts a document, sends to Claude with an extraction prompt, returns structured JSON
- Store chunks + embeddings in Postgres
- Write extracted entities into Neo4j
- **Checkpoint:** run against your 15–20 ground-truth entity labels, get a first accuracy number

### Phase 3 — RAG copilot (Day 3–4)
- Build `/query` endpoint: embed question → pgvector search → graph lookup → Claude answer generation with citations
- **Checkpoint:** run against your 15–20 Q&A pairs, measure answer accuracy

### Phase 4 — Confidence tiering (Day 4, half day)
- Extend the RAG prompt to output a confidence tier alongside the answer
- Add the three-tier badge to the frontend response

### Phase 5 — Compliance engine (Day 5)
- Load 3–5 real ASHRAE/Tier rules into `compliance_rules`
- Build `/compliance` endpoint: check equipment state against rules, generate reasoning trace via Claude
- Dashboard view showing rule → equipment state → gap → reasoning

### Phase 6 — Tacit knowledge capture (Day 6)
- Build `/interview` endpoint: Claude generates targeted questions per equipment based on graph gaps
- Store answers as `TacitKnowledge` nodes linked to equipment
- Confirm these are retrievable through the same `/query` RAG endpoint as any other source

### Phase 7 — Proactive push (Day 6–7)
- On every new document ingestion, run a pattern-match check against existing `Incident`/`FailureMode` nodes
- If similarity/match found, create an alert record
- Frontend alert feed polls or subscribes to new alerts

### Phase 8 — Frontend polish (Day 7–8)
- Mobile-responsive pass on all four views
- Loading states, error handling, clean citation rendering

### Phase 9 — Evaluation (Day 8–9)
- Run full eval set through extraction + RAG, record precision/recall or accuracy numbers
- Document known limitations honestly

### Phase 10 — Deck, diagram, demo video (Day 9–10)
- Architecture diagram reflecting what was actually built
- Demo video recorded early, not last night
- Rehearse pitch and likely judge questions

---

## 6. Suggested Role Split (3 people)

| Person | Owns |
|---|---|
| **A — Data & Graph** | Corpus sourcing/generation, extraction service, Neo4j schema and queries, ground-truth eval set |
| **B — Intelligence** | RAG retrieval, confidence tiering, compliance engine reasoning, proactive pattern-match logic, all Claude prompt design |
| **C — Product & Frontend** | Next.js frontend for all four views, API integration, mobile responsiveness, demo video, deck |

Daily 15-minute sync, merge to a shared branch daily even if rough — don't let three people build in isolation and merge once at the end.

---

## 7. What to Demo (Tie It Together)

Walk the judges through **one hero scenario** end to end:
1. Show a new ticket coming in: "CRAC-3 running hot"
2. Proactive alert fires immediately: matches a pattern from 4 months ago
3. Technician asks the RAG copilot "why does this keep happening?" — gets a cited, confidence-tagged answer
4. Compliance dashboard shows the coil-cleaning rule is overdue, with full reasoning trace
5. Show the tacit knowledge interview: the retiring engineer's answer about this exact failure is now a source the copilot cites

This narrative — one failure, traced through every feature — is far more convincing to judges than showing five disconnected features in isolation.
