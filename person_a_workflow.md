# Person A — Data & Graph: Complete Workflow

**Role:** Owns the data corpus, Neo4j graph database, entity extraction schema, and graph queries.  
**Core responsibility:** Everything that goes *into* and *out of* the knowledge graph — sourcing data, designing the schema, writing the graph layer, and supporting evaluation.

---

## Phase 0 — Setup ✅

### Tasks
- [x] Create the project repo and scaffold the full folder structure
- [x] Set up **Neo4j AuraDB** (free tier) instance
- [x] Get connection credentials (URI, username, password)
- [x] Share `.env.example` with the team containing all required env vars
- [x] Set up Postgres + pgvector via Docker Compose (`docker-compose.yml`)
- [x] Create project `README.md` with full documentation and setup guide
- [x] Scaffold all backend modules (routers, services, models, graph, prompts)

### Completed
- Repo is live at `github.com/Ravindranbit/industrial-knowledge-intelligence`
- Neo4j AuraDB instance is reachable (credentials in `.env`)
- Postgres + pgvector Docker Compose ready (`docker-compose.yml`)
- `.env.example` shared with all required env vars
- Full project README with architecture, setup guide, and API docs
- FastAPI backend scaffolded with all routers, services, and graph layer

---

## Phase 1 — Data Corpus ✅

### Tasks
- [x] Source **1 real CRAC/chiller piping diagram** → `chilled_water_piping_diagram.txt`
- [x] Source **1 real OEM manual excerpt** for a CRAC unit → `oem_manual_liebert_ds.txt`
- [x] Source **real ASHRAE TC9.9 thermal guideline text** → `ashrae_tc9.9_guidelines.txt`
- [x] Organize all sourced documents into `/data/raw/`

### Completed
- `/data/raw/` contains 3 comprehensive documents:
  - `chilled_water_piping_diagram.txt` — Tier III data center chilled water piping schematic with components, flow paths, design parameters
  - `oem_manual_liebert_ds.txt` — Vertiv Liebert DS/DSE CRAC unit manual (specs, installation, controls, maintenance, failure modes)
  - `ashrae_tc9.9_guidelines.txt` — ASHRAE TC9.9 thermal guidelines (classes A1–A4, temperature/humidity tables, 7 compliance rules)

### Dependencies
- **Wait for:** Nothing
- **Unblocks:** Phase 2 (ingestion needs real docs to process)

### Technical Notes
> **Where to find real documents:**
> - **Vertiv** (formerly Liebert): search "Vertiv CRAC unit installation manual PDF" — their Liebert CRV/DS series manuals are often publicly available
> - **Schneider Electric / APC**: search "APC InRow cooling unit manual PDF"
> - **Stulz**: search "Stulz CyberAir manual PDF"
> - **ASHRAE TC9.9**: the 2021 "Thermal Guidelines for Data Processing Environments" whitepaper has publicly cited excerpts; the full document is paywalled, but summary tables are widely reproduced in vendor docs

---

## Phase 2 — Ingestion + Extraction (Day 2–3)
## Phase 2 — Ingestion + Extraction ✅

### Tasks
- [x] Design the **Neo4j schema** — define node types and relationship types
- [x] Write **Neo4j schema initialization** (`schema.py`) — constraints and indexes
- [x] Write **Neo4j write functions** (`write.py`) — 5 create + 5 link functions
- [x] Write **Neo4j driver** (`driver.py`) — singleton with `get_driver()`, `get_session()`, `close_driver()`
- [x] Build **SQLAlchemy models** (`models/database.py`) — `documents`, `chunks` (pgvector), `compliance_rules`
- [x] Build **extraction prompt** (`prompts/extraction.txt`) — structured JSON output format for LLM
- [x] Build **extraction service** (`services/extraction.py`) — Groq LLM entity extraction + text chunking
- [x] Build **embedding service** (`services/embedding.py`) — sentence-transformers (all-MiniLM-L6-v2, dim=384)
- [x] Build **ingestion router** (`routers/ingest.py`) — full pipeline: parse → extract → chunk → embed → store
- [x] Update **main.py** — Postgres + Neo4j init on startup (non-blocking if either is down)
- [ ] Test end-to-end by ingesting a real document from `/data/raw/`

### Completed
- Full ingestion pipeline: document upload → Groq extraction → chunking → embedding → Postgres + Neo4j
- SQLAlchemy models with pgvector for vector similarity search
- Extraction prompt returns structured JSON: equipment, failure_modes, incidents, work_orders, technicians, compliance_rules + relationships
- Neo4j writes are non-blocking — if Neo4j is unreachable, Postgres storage still succeeds
- Embedding model: all-MiniLM-L6-v2 (384 dimensions, fast on CPU)

### Dependencies
- **Requires:** Docker (Postgres) running, Groq API key set

---

## Phase 3 — RAG Copilot (Day 3–4)

### Tasks
- [/] Write **Neo4j read/query functions** — currently have basic stubs:
  - [x] `get_all_equipment()` — all Equipment nodes
  - [x] `get_graph_stats()` — node and relationship counts
  - [ ] `get_equipment_history(equipment_name)` — all incidents, work orders, failure modes linked to an equipment node
  - [ ] `get_related_failures(equipment_name)` — past failure modes and their resolutions
  - [ ] `get_equipment_context(equipment_name)` — full subgraph around an equipment node (for RAG context enrichment)
- [ ] **Support Person B** by tuning graph queries for retrieval relevance — adjust what gets returned based on what produces good RAG answers

### Deliverables
- `backend/app/graph/read.py` — All read/query functions (currently has basic stubs, needs RAG-specific queries)
- Graph queries return well-structured data that Person B can merge with pgvector results for RAG context

### Dependencies
- **Wait for:** Person B to define what context shape they need for the RAG prompt
- **Unblocks:** Person B (needs graph facts to combine with vector search for RAG answers)

### Technical Notes
> The key graph query pattern for RAG is: given an equipment name mentioned in the user's question, traverse 1–2 hops to find all related incidents, failure modes, and work orders. Return them as a flat list of facts that can be injected into the Claude prompt alongside the pgvector chunks.
> ```cypher
> MATCH (e:Equipment {name: $name})-[r]-(related)
> RETURN type(r) AS relationship, labels(related) AS type, properties(related) AS data
> ```

---

## Phase 4 — Confidence Tiering (Day 4, Half Day)

### Tasks
- [ ] No graph changes needed
- [ ] **Support Person B and Person C** if they are blocked on anything

### Deliverables
- None specific — this is a support/buffer phase for you

### What to Do With Free Time
- Clean up graph data for the hero demo scenario
- Add indexes to Neo4j for frequently queried properties (`Equipment.name`, `Incident.date`)
- Write helper scripts to seed/reset demo data quickly

---

## Phase 5 — Compliance Engine (Day 5)

### Tasks
- [ ] Add **`ComplianceRule` nodes** to Neo4j and link them to equipment types:
  ```cypher
  CREATE (r:ComplianceRule {
    clause_ref: "ASHRAE-TC9.9-4.1",
    description: "Coil cleaning interval",
    requirement: "CRAC unit coils must be cleaned every 90 days",
    interval_days: 90
  })
  
  MATCH (e:Equipment {type: "CRAC"}), (r:ComplianceRule {clause_ref: "ASHRAE-TC9.9-4.1"})
  CREATE (e)-[:GOVERNED_BY]->(r)
  ```
- [ ] Write a query to **fetch equipment's current maintenance state** — when was it last cleaned/inspected:
  ```cypher
  MATCH (e:Equipment {name: $name})<-[:ADDRESSES]-(wo:WorkOrder)
  WHERE wo.type = "preventive_maintenance"
  RETURN wo.completed_date AS last_maintained
  ORDER BY wo.completed_date DESC
  LIMIT 1
  ```

### Deliverables
- `ComplianceRule` nodes exist in Neo4j, linked to equipment
- Query functions added to `backend/app/graph/read.py`:
  - `get_compliance_rules_for_equipment(equipment_name)`
  - `get_last_maintenance_date(equipment_name, maintenance_type)`

### Dependencies
- **Wait for:** Nothing
- **Unblocks:** Person B (needs these queries to build the `/compliance` endpoint)

---

## Phase 6 — Tacit Knowledge Capture (Day 6)

### Tasks
- [ ] Add **`TacitKnowledge` node type** to the graph, linked to `Equipment` and `Technician`:
  ```cypher
  CREATE (tk:TacitKnowledge {
    question: $question,
    answer: $answer,
    captured_at: datetime(),
    equipment_context: $equipment_name
  })
  
  MATCH (e:Equipment {name: $equipment_name}), (tk:TacitKnowledge {captured_at: $timestamp})
  CREATE (tk)-[:ABOUT]->(e)
  
  MATCH (t:Technician {name: $technician_name}), (tk:TacitKnowledge {captured_at: $timestamp})
  CREATE (tk)-[:CONTRIBUTED_BY]->(t)
  ```
- [ ] Write a function to **check what's already documented** for a piece of equipment (to identify knowledge gaps for the interview):
  ```cypher
  MATCH (e:Equipment {name: $name})-[r]-(related)
  WITH e, collect(DISTINCT type(r)) AS documented_relationships,
       collect(DISTINCT labels(related)) AS documented_types
  RETURN e.name, documented_relationships, documented_types
  ```

### Deliverables
- `TacitKnowledge` write functions in `backend/app/graph/write.py`
- Gap-detection query in `backend/app/graph/read.py`

### Dependencies
- **Wait for:** Nothing
- **Unblocks:** Person B (needs write functions + gap query for `/interview` endpoint)

---

## Phase 7 — Proactive Push (Day 6–7)

### Tasks
- [ ] Write a **graph query to check a new incident/ticket against existing patterns**:
  ```cypher
  // Given a new incident's equipment and symptoms, find past matches
  MATCH (e:Equipment {name: $equipment_name})<-[:INVOLVES]-(past:Incident)-[:MATCHES_PATTERN]->(fm:FailureMode)
  WHERE fm.description CONTAINS $symptom_keyword
  RETURN past, fm, 
         past.resolution AS past_resolution,
         past.date AS when_it_happened
  ORDER BY past.date DESC
  ```

### Deliverables
- Pattern-matching query function in `backend/app/graph/read.py`:
  - `find_matching_past_incidents(equipment_name, symptom_keywords)`

### Dependencies
- **Wait for:** Nothing
- **Unblocks:** Person B (needs this query for the proactive pattern-match service)

---

## Phase 8 — Frontend Polish (Day 7–8)

### Tasks
- [ ] **Support data cleanup** — make sure the hero scenario data is complete and consistent across all views:
  - CRAC-3 has incidents, work orders, compliance rules, and tacit knowledge all linked correctly
  - The demo flow (new ticket → alert → RAG answer → compliance gap → tacit knowledge citation) works with real data in the graph
- [ ] Seed script that can reset the graph to a clean demo state quickly

### Deliverables
- Hero scenario data is verified end-to-end in Neo4j
- `scripts/seed_demo_data.py` — one-command reset to demo-ready state

---

## Phase 9 — Evaluation (Day 8–9)

### Tasks
- [ ] Help compile **final metrics into a clean summary**:
  - Entity extraction accuracy (precision/recall against ground-truth labels)
  - RAG answer accuracy (against Q&A eval set)
  - Graph statistics: number of nodes, relationships, node types
  - Compliance rules checked, gaps found

### Deliverables
- Metrics summary table ready for the deck:
  | Metric | Value |
  |--------|-------|
  | Entities extracted | X / Y correct |
  | RAG Q&A accuracy | X / Y correct |
  | Graph nodes | N |
  | Graph relationships | M |
  | Compliance rules | K |

---

## Phase 10 — Deck, Diagram, Demo Video (Day 9–10)

### Tasks
- [ ] **Review technical accuracy** of the architecture diagram and deck's technical slides
- [ ] Ensure the graph portion of the architecture diagram correctly shows:
  - Node types and their relationships
  - How graph data flows into RAG and compliance features
- [ ] Prepare to answer judge questions about graph design decisions (why Neo4j, why this schema shape, why not just vector search alone)

### Deliverables
- Architecture diagram reviewed and approved
- Talking points ready for technical Q&A

---

## Progress Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Setup | ✅ Done | Repo, Neo4j, Postgres Docker, README, backend scaffold |
| Phase 1 — Data Corpus | ✅ Done | 3 documents sourced and organized in `/data/raw/` |
| Phase 2 — Ingestion + Extraction | ✅ Done | Full pipeline: Groq extraction, embeddings, Postgres + Neo4j |
| Phase 3 — RAG Copilot | 🟡 In progress | Basic read stubs exist, RAG-specific queries needed |
| Phase 4 — Confidence Tiering | ⬜ Not started | Support/buffer phase |
| Phase 5 — Compliance Engine | ⬜ Not started | ComplianceRule nodes + queries |
| Phase 6 — Tacit Knowledge | ⬜ Not started | TacitKnowledge nodes + gap detection |
| Phase 7 — Proactive Push | ⬜ Not started | Pattern matching query |
| Phase 8 — Frontend Polish | ⬜ Not started | Demo data cleanup + seed script |
| Phase 9 — Evaluation | ⬜ Not started | Metrics compilation |
| Phase 10 — Deck & Demo | ⬜ Not started | Architecture review + Q&A prep |

---

## Key Coordination Points with Team

| When | Coordinate With | About |
|------|----------------|-------|
| Phase 0 | B & C | Share `.env.example`, confirm repo access |
| Phase 2 | **Person B** | Agree on extraction JSON format so write functions match |
| Phase 3 | **Person B** | Agree on what graph context shape the RAG prompt needs |
| Phase 5 | **Person B** | Hand off compliance queries for the `/compliance` endpoint |
| Phase 6 | **Person B** | Hand off tacit knowledge write functions + gap query |
| Phase 7 | **Person B** | Hand off pattern-match query for proactive push |
| Phase 8 | **Person C** | Verify demo data renders correctly in all 4 frontend views |

---

## Quick Reference — All Files Person A Owns

```
backend/app/graph/
├── __init__.py
├── driver.py          # Neo4j connection setup (singleton)          ✅ Done
├── schema.py          # Constraints, indexes, schema initialization ✅ Done
├── write.py           # All create/update functions for graph nodes  ✅ Done
└── read.py            # All query functions (stubs exist)           🟡 In progress

data/
├── raw/               # Sourced real documents                      ⬜ Pending
│   ├── crac_piping_diagram.pdf
│   ├── oem_manual_excerpt.pdf
│   └── ashrae_tc9.9_guidelines.txt

scripts/
└── seed_demo_data.py  # Reset graph to demo-ready state             ⬜ Pending
```
