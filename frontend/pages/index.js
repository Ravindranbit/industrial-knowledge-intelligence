import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare, 
  UploadCloud, 
  ListChecks, 
  Zap, 
  Cpu, 
  Database, 
  Activity, 
  GitBranch, 
  Terminal, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'

const architectureFlows = {
  ingest: {
    title: 'Data Ingestion Pipeline',
    description: 'Raw documents, SOPs, and manuals are processed, chunked, embedded, and mapped to the graph database in real-time.',
    steps: [
      { id: 'step-1', name: 'Document Ingest', icon: UploadCloud, desc: 'PDFs, manuals & logs uploaded to FastAPI.' },
      { id: 'step-2', name: 'LLM Entity Linker', icon: Cpu, desc: 'Groq extracts entities and relations.' },
      { id: 'step-3', name: 'Vector Embedding', icon: Database, desc: 'Text chunks embedded to pgvector (384d).' },
      { id: 'step-4', name: 'Graph Mapping', icon: GitBranch, desc: 'Entity relationships written to local Neo4j.' }
    ]
  },
  query: {
    title: 'Hybrid RAG & AI Chat Flow',
    description: 'Queries undergo hybrid retrieval: matching semantically in pgvector and traversing relationships in Neo4j to supply contextual facts to Groq.',
    steps: [
      { id: 'step-1', name: 'User Query', icon: MessageSquare, desc: 'Operator asks a question in the chat console.' },
      { id: 'step-2', name: 'Hybrid Retrieval', icon: RefreshCw, desc: 'Fetches relevant vector chunks & graph subnets.' },
      { id: 'step-3', name: 'Context Synth', icon: Cpu, desc: 'Groq constructs a grounded response.' },
      { id: 'step-4', name: 'Answer + Citations', icon: ShieldCheck, desc: 'Delivers factual answer linked back to source.' }
    ]
  },
  compliance: {
    title: 'Compliance & Risk Auditing',
    description: 'Equipment logs are parsed against ASHRAE and Uptime standards, mapping gaps through autonomous graph queries.',
    steps: [
      { id: 'step-1', name: 'Equipment Log Intake', icon: Terminal, desc: 'Aggregates current maintenance and sensor state.' },
      { id: 'step-2', name: 'Policy Lookups', icon: ListChecks, desc: 'Fetches target compliance rules from Postgres.' },
      { id: 'step-3', name: 'Gap Evaluation', icon: AlertCircle, desc: 'Finds deviations in graph and vector logs.' },
      { id: 'step-4', name: 'Reasoning Logs', icon: FileText, desc: 'Groq writes compliance trace and severity flags.' }
    ]
  }
}

export default function LandingPage() {
  const [activeFlow, setActiveFlow] = useState('ingest')
  const [hoveredStep, setHoveredStep] = useState(null)

  const currentFlow = architectureFlows[activeFlow]

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 selection:bg-pastel-100 selection:text-pastel-900">
      <style>{`
        @keyframes flow {
          to {
            stroke-dashoffset: -32;
          }
        }
        .animate-flow-line {
          stroke-dasharray: 8, 4;
          animation: flow 1.5s linear infinite;
        }
      `}</style>

      {/* Background glow graphics */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 bg-gradient-to-b from-pastel-500/5 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[350px] w-[350px] rounded-full bg-pastel-600/3 blur-[90px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/3 blur-[100px]" />

      {/* Decorative Grid Lines */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Navbar */}
      <header className="relative z-10 border-b border-slate-200 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pastel-600 shadow-lg shadow-pastel-600/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight text-slate-900 leading-tight">IKI Copilot</div>
              <div className="text-[9px] font-medium text-slate-500">Industrial Operations Suite</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-750 transition duration-200 hover:bg-slate-200/80">
              Console Sign In
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-pastel-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-pastel-600/10 transition duration-200 hover:bg-pastel-500 hover:shadow-pastel-600/25">
              Launch Workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-16 text-center xl:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-pastel-200/60 bg-pastel-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-pastel-750">
          <span className="h-1.5 w-1.5 rounded-full bg-pastel-500 animate-pulse" />
          Platform Release v2.4
        </div>
        <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-[1.15]">
          Grounded AI Intelligence for{' '}
          <span className="bg-gradient-to-r from-pastel-600 via-emerald-600 to-teal-650 bg-clip-text text-transparent">
            Industrial Operations
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
          Synchronize standard operating procedures, guidelines, compliance checklists, and engineer reports. Trace operational recommendations back to structured database facts.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2.5 rounded-2xl bg-pastel-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-pastel-600/15 transition duration-200 hover:-translate-y-0.5 hover:bg-pastel-500 hover:shadow-pastel-600/25 active:translate-y-0">
            Launch Operations Workspace
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <a href="#architecture" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-7 py-4 text-sm font-bold text-slate-750 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-200 active:translate-y-0">
            System Architecture
          </a>
        </div>

        {/* Feature Dashboard Preview Card Mock */}
        <div className="mx-auto mt-16 max-w-5xl rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/60 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="rounded-md bg-slate-200/60 px-4 py-1 text-[10px] text-slate-500 tracking-wide font-mono">
                console.industrial-intelligence.ai
              </div>
              <div className="w-12" />
            </div>
            {/* Visual simulation content */}
            <div className="grid gap-6 p-6 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Health</div>
                  <ShieldCheck className="h-4 w-4 text-pastel-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900">92%</div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-pastel-600 to-emerald-500" />
                </div>
                <div className="text-[10px] text-slate-500">3 rules loaded & evaluated</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Database Sync</div>
                  <Database className="h-4 w-4 text-pastel-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900">Active Nodes</div>
                <div className="flex gap-2">
                  <span className="rounded bg-pastel-500/10 border border-pastel-500/10 px-2 py-0.5 text-[9px] font-medium text-pastel-750">pgvector (5433)</span>
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-700">Neo4j (7687)</span>
                </div>
                <div className="text-[10px] text-slate-500">Dual storage engines verified</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Reasoning Node</div>
                  <Activity className="h-4 w-4 text-pastel-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900">Groq Engine</div>
                <div className="text-[10px] text-slate-500">Connected with valid API Key</div>
                <div className="flex items-center gap-1.5 text-[9px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Reasoning agent live
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Section: "Speak about the product" */}
        <section id="product-info" className="mx-auto mt-28 max-w-6xl py-12 text-left">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-pastel-200 bg-pastel-50 px-3 py-1 text-xs font-semibold text-pastel-750">
                Product Context
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Bridging the Gap Between Policy and Action
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                IKI Copilot serves as the centralized intelligence layer for mission-critical facility engineering and maintenance. Standard operating procedures (SOPs), ASHRAE guidelines, and historical event logs are synthesized into a coherent knowledge graphs, allowing operators to run live compliance audits and verify field operations.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pastel-100 text-pastel-750">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Deterministic Compliance Tracking</h4>
                    <p className="mt-1 text-xs text-slate-500">Audit maintenance logs against Uptime Institute Tier standards. Map compliance status directly to individual plant assets.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pastel-100 text-pastel-750">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Grounded Knowledge Retrieval (RAG)</h4>
                    <p className="mt-1 text-xs text-slate-500">Combine relational text semantic matching in Postgres with topological entity routing in Neo4j to eliminate AI hallucination.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pastel-100 text-pastel-750">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Guided Field Expert Intake</h4>
                    <p className="mt-1 text-xs text-slate-500">Capture tribal engineering knowledge via structured, guided conversation workflows before technicians rotate out.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Performance Highlights */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:p-8 space-y-6">
              <h3 className="font-bold text-slate-900 text-lg">System Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reasoning Model</div>
                  <div className="mt-2 font-bold text-slate-900 text-sm">Groq Llama-3-8b</div>
                  <div className="mt-1 text-[10px] text-slate-500">Sub-second inference</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vector Embedding</div>
                  <div className="mt-2 font-bold text-slate-900 text-sm">BGE-Small-EN</div>
                  <div className="mt-1 text-[10px] text-slate-500">384 Dimensions</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Graph Engine</div>
                  <div className="mt-2 font-bold text-slate-900 text-sm">Neo4j Cypher</div>
                  <div className="mt-1 text-[10px] text-slate-500">Relationship traversal</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vector Extension</div>
                  <div className="mt-2 font-bold text-slate-900 text-sm">pgvector</div>
                  <div className="mt-1 text-[10px] text-slate-500">Cosine distance index</div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">Average pipeline latency</span>
                  <span className="font-bold text-pastel-750 bg-pastel-100/50 px-2 py-0.5 rounded-full">0.05s</span>
                </div>
                <div className="mt-3 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">AI answer factuality rate</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-full">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Architecture and Motion Flow Diagrams */}
        <section id="architecture" className="mx-auto mt-28 max-w-6xl py-12 text-left scroll-mt-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-pastel-200 bg-pastel-50 px-3 py-1 text-xs font-semibold text-pastel-750">
              Interactive System Architecture
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Unified Data Processing Flow
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs text-slate-500">
              Toggle between the core system workflows to view the motion flow and trace how data moves through our FastAPI backend, pgvector, Neo4j, and Groq.
            </p>

            {/* Switcher Tabs */}
            <div className="mt-8 inline-flex gap-1 rounded-2xl bg-slate-200/60 p-1 border border-slate-200">
              <button 
                onClick={() => setActiveFlow('ingest')} 
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${activeFlow === 'ingest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-pastel-700 hover:bg-pastel-100/60'}`}
              >
                1. Data Ingestion
              </button>
              <button 
                onClick={() => setActiveFlow('query')} 
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${activeFlow === 'query' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-pastel-700 hover:bg-pastel-100/60'}`}
              >
                2. AI Chat & RAG
              </button>
              <button 
                onClick={() => setActiveFlow('compliance')} 
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${activeFlow === 'compliance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-pastel-700 hover:bg-pastel-100/60'}`}
              >
                3. Compliance Audits
              </button>
            </div>
          </div>

          {/* Architecture Visualization Panel */}
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:p-8">
            <div className="mb-6 flex flex-col justify-between border-b border-slate-200 pb-6 md:flex-row md:items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{currentFlow.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{currentFlow.description}</p>
              </div>
            </div>

            {/* SVG Motion Flow Diagram Container */}
            <div className="relative flex flex-col items-center justify-between gap-8 py-8 lg:flex-row lg:gap-4 lg:px-8">
              {currentFlow.steps.map((step, idx) => {
                const StepIcon = step.icon
                const isHovered = hoveredStep === step.id
                return (
                  <div key={step.id} className="relative flex flex-1 flex-col items-center w-full lg:w-auto">
                    {/* SVG Connector Line */}
                    {idx < currentFlow.steps.length - 1 && (
                      <div className="hidden lg:block absolute left-[calc(50%+45px)] top-[26px] w-[calc(100%-90px)] h-2">
                        <svg className="w-full h-2 overflow-visible" fill="none">
                          {/* Static background path */}
                          <line x1="0" y1="4" x2="100%" y2="4" stroke="#E9E3D9" strokeWidth="2" />
                          {/* Animated flow path */}
                          <line 
                            x1="0" 
                            y1="4" 
                            x2="100%" 
                            y2="4" 
                            stroke="url(#pastel-gradient)" 
                            strokeWidth="3.5" 
                            className="animate-flow-line" 
                          />
                          <defs>
                            <linearGradient id="pastel-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#CBE8DB" />
                              <stop offset="50%" stopColor="#52B383" />
                              <stop offset="100%" stopColor="#3FA271" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}

                    {/* Step Card with Hover Effects */}
                    <div 
                      onMouseEnter={() => setHoveredStep(step.id)}
                      onMouseLeave={() => setHoveredStep(null)}
                      className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border transition duration-300 ${isHovered ? 'border-pastel-500 bg-pastel-50 text-pastel-750 scale-110 shadow-lg shadow-pastel-500/10' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                    >
                      <StepIcon className="h-6 w-6" />
                      {/* Active Status Pulse */}
                      <span className={`absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-pastel-500 transition duration-300 ${isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                    </div>

                    <div className="mt-4 text-center">
                      <div className="text-xs font-bold text-slate-900">{step.name}</div>
                      <p className="mx-auto mt-1 max-w-[170px] text-[10px] text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section id="features" className="mx-auto mt-20 max-w-6xl py-12 text-left">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
              Designed for High-Reliability Operations
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs text-slate-500">
              Four fundamental software workflows engineered to bridge institutional knowledge gaps and reduce compliance drift.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card group hover:-translate-y-1 hover:border-slate-350 hover:shadow-2xl">
              <div className="rounded-2xl bg-pastel-50 border border-pastel-200/60 p-3 text-pastel-750 w-fit group-hover:bg-pastel-600 group-hover:text-white transition">
                <UploadCloud className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Document Intake</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Drag, drop, and extract semantic guidelines from PDFs, drawings, and operating manuals directly into the connected knowledge graph.
              </p>
            </div>
            <div className="card group hover:-translate-y-1 hover:border-slate-350 hover:shadow-2xl">
              <div className="rounded-2xl bg-teal-50 border border-teal-200/60 p-3 text-teal-650 w-fit group-hover:bg-teal-650 group-hover:text-white transition">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">AI Operations Copilot</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Ask operational questions, trace answers back to engineering manuals, inspect citations, and avoid hallucinated procedures.
              </p>
            </div>
            <div className="card group hover:-translate-y-1 hover:border-slate-350 hover:shadow-2xl">
              <div className="rounded-2xl bg-purple-50 border border-purple-200/60 p-3 text-purple-650 w-fit group-hover:bg-purple-650 group-hover:text-white transition">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Compliance Monitor</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Track regulatory requirements, audit equipment logs against policies, and inspect historical evidence gaps in one interface.
              </p>
            </div>
            <div className="card group hover:-translate-y-1 hover:border-slate-350 hover:shadow-2xl">
              <div className="rounded-2xl bg-amber-50 border border-amber-200/60 p-3 text-amber-650 w-fit group-hover:bg-amber-650 group-hover:text-white transition">
                <ListChecks className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Guided Interviews</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Conduct structured, step-wise interviews with field technicians to digitize, capture, and package undocumented site operations.
              </p>
            </div>
          </div>
        </section>

        <footer className="mx-auto mt-28 border-t border-slate-200 py-12 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Industrial Knowledge Intelligence. All rights reserved.</p>
        </footer>
      </main>
    </div>
  )
}

LandingPage.pageMeta = { title: 'Industrial Knowledge AI', description: 'Grounded operations & compliance platform.', breadcrumbs: ['Landing'] }
