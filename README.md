# 🏭 Industrial Knowledge Intelligence

An AI-powered knowledge management system for **data center cooling operations**. It combines a **knowledge graph** (Neo4j), **vector search** (Postgres + pgvector), and **Claude AI** to help technicians diagnose equipment failures, ensure compliance, and capture institutional expertise before it walks out the door.

---

## 🎯 What It Does

### 1. RAG-Powered Copilot
Technicians ask questions in natural language (e.g., *"Why does CRAC-3 keep running hot?"*). The system retrieves relevant document chunks via vector similarity search, enriches them with structured graph context (equipment history, linked incidents, failure modes), and generates a **cited, confidence-rated answer** using Claude.

### 2. Intelligent Document Ingestion
Upload maintenance tickets, OEM manuals, inspection reports, or incident logs. Claude extracts structured entities (equipment, failure modes, technicians, dates) and writes them into both the vector store and the knowledge graph — making every new document immediately searchable and connected.

### 3. Compliance Engine
Compares real equipment maintenance state against stored rules (e.g., ASHRAE TC9.9 guidelines, Tier standards). For every gap, Claude generates a full **reasoning trace** — not just a flag, but an explanation of *why* there's a violation and what the rule requires.

### 4. Tacit Knowledge Capture
Senior engineers hold decades of undocumented expertise. This feature runs structured interviews: Claude generates targeted questions based on **gaps** in the knowledge graph for specific equipment, and stores the engineer's answers as first-class knowledge nodes — retrievable through the same RAG pipeline as any document.

### 5. Proactive Alerts
Every time a new document is ingested, the system pattern-matches against historical failure modes and incidents. If a match is found (e.g., a new ticket mirrors a failure pattern from months ago), an alert is pushed to the feed — enabling teams to act *before* problems escalate.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│                                                                   │
│   ┌───────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────┐│
│   │ RAG Chat  │  │  Compliance  │  │  Tacit KB  │  │ Proactive ││
│   │ Interface │  │  Dashboard   │  │  Interview │  │ Alert Feed││
│   └─────┬─────┘  └──────┬───────┘  └─────┬──────┘  └─────┬─────┘│
└─────────┼───────────────┼────────────────┼───────────────┼───────┘
          │               │                │               │
          └───────────────┴────────────────┴───────────────┘
                              │ REST API
          ┌───────────────────▼────────────────────┐
          │        BACKEND (FastAPI, Python)        │
          │                                         │
          │  /ingest      /query      /compliance   │
          │  /interview   /alerts     /graph        │
          └──┬──────────┬────────────┬───────────┬──┘
             │          │            │           │
    ┌────────▼───┐ ┌────▼──────┐ ┌───▼───────┐ ┌▼──────────────┐
    │ Postgres + │ │  Neo4j    │ │  Claude   │ │ Proactive     │
    │ pgvector   │ │  AuraDB   │ │  API      │ │ Pattern Match │
    │ (vectors)  │ │  (graph)  │ │  (LLM)    │ │ Service       │
    └────────────┘ └───────────┘ └───────────┘ └───────────────┘
```

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | FastAPI (Python) | REST API — ingestion, RAG query, compliance, interviews, alerts |
| **Graph DB** | Neo4j AuraDB | Stores equipment, failure modes, incidents, work orders, compliance rules as a connected graph |
| **Vector DB** | Postgres + pgvector | Stores document chunks and embeddings for similarity search |
| **LLM** | Claude API (Anthropic) | Entity extraction, RAG answer generation, compliance reasoning, interview question generation |
| **Frontend** | Next.js 14 | Enterprise dashboard, AI chat, compliance monitoring, interview workflow, document intake, alert center |

---

## 📁 Project Structure

```
industrial-knowledge-intelligence/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI entrypoint
│   │   ├── config.py                   # Environment & settings (pydantic-settings)
│   │   ├── test_connectivity.py        # Verify Neo4j, Postgres, Claude connectivity
│   │   │
│   │   ├── routers/                    # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── ingest.py              # POST /ingest — document upload & processing
│   │   │   ├── query.py               # POST /query — RAG question answering
│   │   │   ├── compliance.py          # GET  /compliance — rule-based checks
│   │   │   ├── interview.py           # POST /interview — tacit knowledge capture
│   │   │   └── alerts.py              # GET  /alerts — proactive pattern alerts
│   │   │
│   │   ├── services/                   # Core business logic
│   │   │   ├── __init__.py
│   │   │   ├── extraction.py          # Claude-based entity extraction from docs
│   │   │   ├── retrieval.py           # pgvector similarity + graph retrieval (RAG)
│   │   │   ├── confidence.py          # Three-tier confidence scoring
│   │   │   ├── compliance_engine.py   # Rule evaluation & reasoning traces
│   │   │   └── pattern_match.py       # Proactive failure pattern detection
│   │   │
│   │   ├── models/                     # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   └── database.py            # DB engine & session setup
│   │   │
│   │   ├── graph/                      # Neo4j integration layer
│   │   │   ├── __init__.py
│   │   │   ├── driver.py              # Neo4j connection driver
│   │   │   ├── schema.py              # Graph schema constraints & indexes
│   │   │   ├── read.py                # Cypher read queries
│   │   │   └── write.py               # Cypher write queries (entity insertion)
│   │   │
│   │   └── prompts/                    # Claude prompt templates (kept separate from code)
│   │       ├── __init__.py
│   │       └── README.md              # Prompt design guidelines
│   │
│   └── requirements.txt               # Python dependencies
│
├── data/
│   ├── raw/                            # Real documents (OEM manuals, ASHRAE text, diagrams)
│   ├── synthetic/                      # Generated maintenance tickets, PM reports, incidents
│   └── eval/                           # Ground-truth entity labels & Q&A pairs for evaluation
│
├── docs/
│   ├── architecture.md                 # System architecture overview
│   └── known_limitations.md            # Documented limitations & trade-offs
│
├── scripts/                            # Utility & setup scripts
│
├── docker-compose.yml                  # Postgres 16 + pgvector (local development)
├── .env.example                        # Environment variable template
├── .gitignore                          # Git ignore rules
└── README.md
```

---

## 🛠️ Setup Guide

### Prerequisites

- **Python 3.11+**
- **Docker Desktop** (for local Postgres + pgvector)
- **Node.js 18+** (for frontend — coming soon)
- **Neo4j AuraDB** account ([aura.neo4j.io](https://aura.neo4j.io)) — free tier works
- **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com))

### 1. Clone the Repository

```bash
git clone https://github.com/Ravindranbit/industrial-knowledge-intelligence.git
cd industrial-knowledge-intelligence
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

| Variable | Where to Get It |
|----------|----------------|
| `NEO4J_URI` | Neo4j AuraDB console → your instance details |
| `NEO4J_USER` | Neo4j AuraDB console (usually `neo4j`) |
| `NEO4J_PASSWORD` | Generated when you create the AuraDB instance |
| `POSTGRES_URL` | Keep the default for local Docker setup |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |

### 3. Start Postgres + pgvector (Docker)

```bash
docker compose up -d
```

This starts a Postgres 16 instance with the pgvector extension pre-installed. Default connection:

```
postgresql://postgres:postgres@localhost:5432/datacenter_kb
```

Verify it's running:

```bash
docker compose ps
```

### 4. Install Python Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 5. Run the Backend

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 6. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies API calls to the backend through local Next.js routes.

### 7. Verify Connectivity

Test that all external services are reachable:

```bash
python app/test_connectivity.py
```

---

## 📊 Data Model

### Postgres (Vector Store)

| Table | Purpose |
|-------|---------|
| `documents` | Metadata for uploaded documents (title, type, source path) |
| `chunks` | Document chunks with vector embeddings for similarity search |
| `compliance_rules` | ASHRAE/Tier rules with clause references and interval requirements |

### Neo4j (Knowledge Graph)

```
(Equipment)-[:HAS_FAILURE_MODE]→(FailureMode)
(Incident)-[:INVOLVES]→(Equipment)
(Incident)-[:MATCHES_PATTERN]→(FailureMode)
(WorkOrder)-[:RESOLVED_BY]→(Technician)
(WorkOrder)-[:ADDRESSES]→(Incident)
(Equipment)-[:GOVERNED_BY]→(ComplianceRule)
(TacitKnowledge)-[:ABOUT]→(Equipment)
(TacitKnowledge)-[:CONTRIBUTED_BY]→(Technician)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ingest` | Upload and process a document (extract entities, store embeddings) |
| `POST` | `/query` | Ask a question — returns a cited, confidence-rated answer |
| `GET` | `/compliance` | Run compliance checks against stored rules |
| `POST` | `/interview` | Generate interview questions / submit engineer answers |
| `GET` | `/alerts` | Fetch proactive alerts from pattern matching |
| `GET` | `/graph` | Query the knowledge graph directly |

---

## 🧪 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Web Framework | FastAPI | 0.115.12 |
| Graph Database | Neo4j (via `neo4j` driver) | 5.28.1 |
| Vector Database | PostgreSQL + pgvector | PG 16 + pgvector 0.4.0 |
| ORM | SQLAlchemy | 2.0.41 |
| LLM | Anthropic Claude API | 0.52.0 |
| Embeddings | sentence-transformers | 4.1.0 |
| Frontend | Next.js 14 + Tailwind CSS + Lucide + Framer Motion | Enterprise dashboard UI |

---

## 📜 License

This project is developed as part of an academic/hackathon initiative.
