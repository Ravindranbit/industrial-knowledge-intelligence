# Task Breakdown — 3-Person Split

Roles (kept consistent from the implementation plan):
- **Person A — Data & Graph**
- **Person B — Intelligence (RAG/Compliance/Proactive)**
- **Person C — Product & Frontend**

Each phase below lists tasks per person for that stretch of days, plus the shared checkpoint that closes the phase. Work in parallel within a phase; sync daily.

---

## Phase 0 — Setup (Half day)

**Person A**
- [ ] Create repo, scaffold folder structure
- [ ] Set up Neo4j AuraDB (free tier) instance, get connection credentials
- [ ] Share `.env.example` with the team

**Person B**
- [ ] Set up Postgres + pgvector (Docker locally, or Railway/Render managed)
- [ ] Wire up Claude API key, confirm one test call works end-to-end
- [ ] Draft the first extraction prompt template (rough version, to be refined in Phase 2)

**Person C**
- [ ] Scaffold Next.js frontend project
- [ ] Set up basic routing for the four views (chat, compliance, interview, alerts) with placeholder content
- [ ] Set up deployment pipeline (Vercel) so every merge auto-deploys

**Checkpoint:** All three services can talk to each other with a "hello world" request through the full stack.

---

## Phase 1 — Data Corpus (Day 1–2)

**Person A**
- [ ] Source 1 real CRAC/chiller piping diagram (search vendor sites: Vertiv, Schneider Electric, Stulz)
- [ ] Source 1 real OEM manual excerpt for a CRAC unit
- [ ] Source real ASHRAE TC9.9 thermal guideline text (public excerpts)
- [ ] Organize all of the above into `/data/raw/`

**Person B**
- [ ] Draft prompts to generate 15–30 synthetic maintenance tickets (consistent format)
- [ ] Draft prompts to generate 10–15 synthetic PM (preventive maintenance) reports
- [ ] Draft prompts to generate 5–10 synthetic incident/near-miss logs
- [ ] Hand-edit generated docs for realism, save to `/data/synthetic/`

**Person C**
- [ ] Write the 15–20 ground-truth entity labels (equipment, failure mode, date, technician, etc.)
- [ ] Write the 15–20 ground-truth Q&A pairs with correct answers, save to `/data/eval/`
- [ ] Start wireframing the four frontend views based on what data will actually be shown

**Checkpoint:** Full corpus + eval set exists and is agreed on by all three as "what done looks like."

---

## Phase 2 — Ingestion + Extraction (Day 2–3)

**Person A**
- [ ] Design Neo4j schema (node types, relationship types — see data model in implementation plan)
- [ ] Write Neo4j write functions (insert equipment, failure mode, incident nodes + relationships)
- [ ] Test schema manually with a handful of sample entities

**Person B**
- [ ] Build `/ingest` endpoint (FastAPI route)
- [ ] Refine extraction prompt, get clean structured JSON output from Claude for each doc type
- [ ] Wire extraction output into both Postgres (chunks + embeddings) and Neo4j (via Person A's functions)

**Person C**
- [ ] Build a simple document upload UI (drag-and-drop or file picker) hitting `/ingest`
- [ ] Show ingestion status/progress in the UI
- [ ] Begin building the "equipment view" page showing extracted facts for one piece of equipment

**Checkpoint:** Run extraction against the 15–20 ground-truth entity labels, record first accuracy number.

---

## Phase 3 — RAG Copilot (Day 3–4)

**Person A**
- [ ] Write Neo4j query functions to fetch related facts for a given question/equipment (graph lookup)
- [ ] Support Person B by tuning graph queries for retrieval relevance

**Person B**
- [ ] Build `/query` endpoint: embed question → pgvector similarity search → merge with graph facts
- [ ] Build the RAG prompt: answer strictly from retrieved context, include citations
- [ ] Test against the 15–20 Q&A pairs, iterate on prompt until accuracy is acceptable

**Person C**
- [ ] Build the chat interface (question box, streaming or loading state, answer display)
- [ ] Render citations as clickable references back to source documents
- [ ] Handle empty/error states gracefully

**Checkpoint:** Run the 15–20 Q&A pairs through `/query`, record accuracy number for the deck.

---

## Phase 4 — Confidence Tiering (Day 4, half day)

**Person A**
- [ ] No graph changes needed; support B/C if blocked elsewhere

**Person B**
- [ ] Extend RAG prompt to output one of three confidence tiers alongside the answer
- [ ] Add simple logic: if no relevant chunks retrieved, force "no reliable source" tier

**Person C**
- [ ] Add a confidence badge to the chat UI (color-coded: high / verify / escalate)

**Checkpoint:** Every RAG answer in the demo now shows a confidence tier.

---

## Phase 5 — Compliance Engine (Day 5)

**Person A**
- [ ] Add `ComplianceRule` nodes to Neo4j, link to equipment types
- [ ] Write query to fetch equipment's current maintenance state (last cleaned/inspected date)

**Person B**
- [ ] Load 3–5 real ASHRAE/Tier rules into `compliance_rules` table
- [ ] Build `/compliance` endpoint: compare equipment state vs. rules
- [ ] Build reasoning-trace prompt: Claude explains which rule, which state, why it's a gap

**Person C**
- [ ] Build compliance dashboard view: list of equipment, pass/fail status, expandable reasoning trace

**Checkpoint:** Dashboard shows at least one real compliance gap with a full, readable reasoning trace.

---

## Phase 6 — Tacit Knowledge Capture (Day 6)

**Person A**
- [ ] Add `TacitKnowledge` node type, link to `Equipment` and `Technician`
- [ ] Write function to check what's already documented for a piece of equipment (to identify gaps)

**Person B**
- [ ] Build `/interview` endpoint: Claude generates targeted questions based on documented gaps
- [ ] Store engineer's answers as embeddings (Postgres) + graph nodes (Neo4j)
- [ ] Confirm these answers are retrievable through the existing `/query` RAG endpoint

**Person C**
- [ ] Build the interview flow UI: equipment selector → generated questions → free-text answer capture
- [ ] Show confirmation that the answer has been saved and is now searchable

**Checkpoint:** Ask the RAG copilot a question whose only source is an interview answer — confirm it's cited correctly.

---

## Phase 7 — Proactive Push (Day 6–7)

**Person A**
- [ ] Write graph query to check a new incident/ticket against existing `FailureMode`/`Incident` patterns

**Person B**
- [ ] Build pattern-match logic: on every new document ingestion, run the check automatically
- [ ] If a match is found, create an alert record with a generated explanation

**Person C**
- [ ] Build the alert feed UI: list of proactive alerts, most recent first, linking back to the matched past incident

**Checkpoint:** Ingest a new ticket matching your hero scenario, confirm an alert fires automatically without anyone querying.

---

## Phase 8 — Frontend Polish (Day 7–8)

**Person A**
- [ ] Support data cleanup — make sure hero scenario data is complete and consistent across all views

**Person B**
- [ ] Tune all prompts one more pass for consistency and demo reliability
- [ ] Add basic error handling/fallbacks for API failures

**Person C**
- [ ] Mobile-responsive pass on all four views
- [ ] Consistent styling, loading states, polish pass

**Checkpoint:** Full demo flow works smoothly on both desktop and mobile.

---

## Phase 9 — Evaluation (Day 8–9)

**Person A**
- [ ] Help compile final metrics into a clean summary (accuracy numbers, graph stats)

**Person B**
- [ ] Run full eval set through extraction + RAG one final time, lock in final numbers
- [ ] Write the "known limitations" doc honestly

**Person C**
- [ ] Start building the architecture diagram based on what was actually built
- [ ] Start drafting deck structure

**Checkpoint:** All metrics finalized, known limitations documented.

---

## Phase 10 — Deck, Diagram, Demo Video (Day 9–10)

**Person A**
- [ ] Review technical accuracy of architecture diagram and deck's technical slides

**Person B**
- [ ] Prepare answers to likely judge questions on the AI/reasoning side (why confidence tiering, why this compliance approach)

**Person C**
- [ ] Finalize deck, record demo video early (not the last night)
- [ ] Rehearse the live pitch with the team, including the hero-scenario walkthrough

**Checkpoint:** Demo video recorded, deck finalized, pitch rehearsed at least twice as a team.

---

## Daily Rhythm (Every Day, All Phases)

- 15-minute morning sync: what got built yesterday, what's blocking, today's target
- Merge to shared branch daily, even if rough
- Add anything broken or descoped to the "known limitations" doc as you go, not at the end
