# Industrial Knowledge Intelligence (IKI Copilot) — UI & Project Demo Script

## Introduction (The Problem & The Architecture Engine)
**Component/Page Name:** `index.js` (Landing Page & Architecture Visualizer)

**Visual:** 
- Start on the public **Landing Page** (`http://localhost:3000/#architecture`).
- Show the sleek header and toggle smoothly between the 3 animated **Unified Data Processing Flow** tabs (`1. Data Ingestion`, `2. AI Chat & RAG`, `3. Compliance Audits`) while speaking.

**Voiceover:** 
"Welcome to Industrial Knowledge Intelligence. In a modern data center, keeping servers cool and powered is critical—a few seconds of downtime can cost millions. But there's a massive problem: critical knowledge about how to keep the facility running is either locked in a retiring engineer's head, or scattered across disconnected ticketing systems, PDF manuals, and inspection reports. 

Today, we'll walk through our unified command center. As you see here on our live architecture visualizer, our platform ingests raw documents, generates 384-dimensional vector embeddings in `pgvector`, and maps physical relationships into a local `Neo4j` knowledge graph—all powered by ultra-fast LLM reasoning via Groq. Let's step inside the live facility."

---

## 1. Enterprise Workspace / Home Dashboard
**Component/Page Name:** `dashboard.js` (Main Operational Workspace)

**Visual:** 
- Click into or navigate to the live **Enterprise Workspace** (`http://localhost:3000/dashboard`).
- Pan across metric cards: **Indexed docs**, **Open risks**, **Today's chats**, **Interviews**.
- Highlight the **"Next best actions"** cards and the live **"Risk snapshot"** right-hand panel.
- Scroll slightly to show the real-time **"Recent activity"** stream at the bottom.

**Voiceover:** 
"Our journey inside begins on the main Enterprise Workspace (`dashboard.js`), the central nervous system of the facility. Instead of forcing technicians to log into five different tools to understand the state of the data center, everything is brought together here. 

At a glance, you see the health of your core services and how much unstructured data has been converted into structured, searchable facts. The 'Next best actions' don't just show static data; they actively guide technicians to their highest-value tasks, while the 'Risk snapshot' provides a live operational signal of what needs immediate attention. This dashboard takes a messy web of disconnected systems and turns it into one actionable command center."

---

## 2. Alert Operations Center (Proactive Push)
**Component/Page Name:** `alerts.js`

**Visual:** 
- Navigate to `http://localhost:3000/alerts`.
- Highlight the **Severity trend charts** at the top.
- Focus on a specific pattern-match alert like *"Humidity drift detected in Zone 3"* and expand/view its timeline of events.

**Voiceover:** 
"Usually, technicians only find out about a problem after an alarm goes off. Our Alert Operations Center (`alerts.js`) changes that by acting proactively. 

Whenever a new maintenance ticket or sensor reading comes in, our FastAPI backend automatically runs a background pattern check against our `Neo4j` historical knowledge graph. If a new ticket matches a failure mode from four months ago, the system instantly surfaces a warning here—before the issue escalates. It taps the operator on the shoulder, categorizing risks by severity and providing a direct path to investigate the root cause, stopping history from repeating itself."

---

## 3. Compliance Monitoring Dashboard (Explainable Compliance)
**Component/Page Name:** `compliance.js`

**Visual:** 
- Navigate to `http://localhost:3000/compliance`.
- Search for equipment `CRAC-3` or filter by active equipment.
- Run or review a live compliance audit.
- Scroll down to show the **Pass/Fail pills** and expand the detailed reasoning text for a failed policy check.

**Voiceover:** 
"In a data center, compliance is often checked manually, meaning overdue inspections can hide in plain sight. With the Compliance Dashboard (`compliance.js`), checking rules against standards like ASHRAE is automated and, crucially, **explainable**.

When you run an audit on an asset like a CRAC unit, the system compares its real maintenance state against stored database policies. But we don't believe in black-box AI: for every gap, our engine generates a full reasoning trace—explaining exactly *which* rule applies, *what* the equipment's current state is, and *why* it's considered a violation. This makes facility audits completely transparent, verifiable, and traceable."

---

## 4. AI Copilot / Chat (Hybrid RAG & Confidence-Aware Answers)
**Component/Page Name:** `chat.js`

**Visual:** 
- Navigate to `http://localhost:3000/chat`.
- Click on a suggested prompt or type: *"Why does CRAC-3 keep short-cycling?"*
- Highlight the AI's instant response, pointing out the **direct source citations**, the retrieved chunks, and the **confidence rating** badge.

**Voiceover:** 
"When a technician needs to troubleshoot on the floor, they turn to our AI Copilot (`chat.js`). This isn't a generic chatbot; it uses **Hybrid RAG**—combining semantic vector search in `pgvector` with relational traversal in `Neo4j` so it understands exact physical dependencies across equipment.

Instead of hunting through binders, an operator asks a natural question. The Copilot retrieves the answer directly from real maintenance history, incident reports, and OEM manuals. Most importantly, it provides direct citations and an explicit confidence rating. In a mission-critical facility, a confident wrong answer is dangerous. Our system tells you exactly where its information came from so operators can verify facts instantly."

---

## 5. Document Intake / Ingestion Engine
**Component/Page Name:** `ingest.js`

**Visual:** 
- Navigate to `http://localhost:3000/ingest`.
- Simulate dropping or submitting a document (like a PDF manual or raw maintenance text report).
- Show the visual breakdown of extracted entities (Equipment, Failure Modes, Technicians, Relationships).

**Voiceover:** 
"How does the AI know all this? Through our automated Document Intake engine (`ingest.js`). 

You can drop in unstructured text—like an old inspection report, a maintenance ticket, or a PDF manual. Our extraction pipeline reads the document via Groq LLM and automatically extracts structured operational entities: equipment names, failure modes, dates, and technician actions. It stores the semantic chunks in Postgres while linking the physical entities in our Neo4j graph. We turn a messy filing cabinet of unstructured text into a clean, connected knowledge graph in real-time."

---

## 6. Guided Interview Workflow (Tacit Knowledge Capture)
**Component/Page Name:** `interview.js`

**Visual:** 
- Navigate to `http://localhost:3000/interview`.
- Walk through the structured workflow steps: Select asset `CRAC-3`, generate AI questions, review the dynamic prompts, and show how answers are saved.

**Voiceover:** 
"Finally, we address the biggest risk of all: retiring experts. Much of the knowledge required to run a data center isn't written in a manual—it's in the heads of senior engineers. 

To solve this, we built the Guided Interview Workflow (`interview.js`). You select an asset, and the system dynamically generates targeted questions based on what the graph *doesn't* yet know. It runs a structured interview, prompting the expert to explain the 'why' behind their troubleshooting steps. Once saved, this tacit knowledge becomes a first-class node in the database, ensuring that decades of judgment and experience are digitized and preserved forever."

---

## Conclusion
**Visual:** 
- Click back to the main **Enterprise Workspace** (`dashboard.js`) and slowly zoom out or show the clean, healthy system status.

**Voiceover:** 
"Industrial Knowledge Intelligence isn't just a search tool. By ingesting scattered documents, mapping graph relationships, catching proactive alerts, and capturing human expertise, we transform fragmented data into a connected operational brain—keeping data centers cool, compliant, and online. Thank you."
