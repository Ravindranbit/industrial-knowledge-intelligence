import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, ShieldAlert, MessageSquare, UploadCloud, Gauge, Plus, Clock3, Sparkles } from 'lucide-react'
import { StatCard, SectionHeader, LinkCard, Timeline, StatusPill, EmptyState } from '../components/enterprise-ui'

const quickActions = [
  { href: '/ingest', title: 'Upload a document', description: 'Ingest SOPs, manuals, or incident reports and watch them process end-to-end.', icon: UploadCloud, meta: 'Recommended next step' },
  { href: '/chat', title: 'Ask the copilot', description: 'Summarize incidents, compare rule sets, or trace an answer back to sources.', icon: MessageSquare, meta: 'Best for fast answers' },
  { href: '/compliance', title: 'Review risk', description: 'Check equipment posture, evidence gaps, and unresolved findings.', icon: ShieldAlert, meta: 'Operational insight' },
  { href: '/interview', title: 'Capture tacit knowledge', description: 'Step through guided questioning for technicians and site leads.', icon: FileText, meta: 'Workflow capture' },
]

export default function Dashboard() {
  const [data, setData] = useState({
    metrics: {
      indexed_docs: 0,
      open_risks: 0,
      today_chats: 0,
      interviews: 0,
      compliance_score: '100%'
    },
    activity: []
  })

  useEffect(() => {
    async function loadSummary() {
      try {
        const r = await fetch('/api/proxy-dashboard-summary')
        if (r.ok) {
          const res = await r.json()
          if (res.status === 'success') {
            setData({
              metrics: res.metrics,
              activity: res.activity
            })
          }
        }
      } catch (e) {
        console.error('Error fetching dashboard summary:', e)
      }
    }
    loadSummary()
  }, [])

  return (
    <div className="space-y-6">
      {/* Top Banner Section */}
      <section className="rounded-3xl border border-zinc-200 bg-gradient-to-r from-pastel-50/80 via-white/50 to-pastel-50/40 p-6 text-zinc-800 shadow-sm xl:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pastel-200/60 bg-pastel-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-pastel-750">
              <span className="h-1.5 w-1.5 rounded-full bg-pastel-500 animate-pulse" />
              Enterprise AI Operations
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-zinc-900 xl:text-4xl">
              Keep engineering, operations, and compliance in one guided workspace.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-550">
              Review the current posture, upload new knowledge, ask the copilot for grounded answers, and move directly into the next best action.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/ingest" className="inline-flex items-center gap-2 rounded-2xl bg-pastel-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pastel-600/15 transition duration-200 hover:-translate-y-0.5 hover:bg-pastel-500">
                <Plus className="h-4 w-4" />
                Start an intake
              </Link>
              <Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-700 transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-100/85">
                Open AI chat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between rounded-2xl bg-zinc-50 border border-zinc-200/60 p-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Platform health</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">All core services operational</div>
              </div>
              <StatusPill tone="green">Healthy</StatusPill>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600">
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3"><div className="text-zinc-500 font-medium">Indexed docs</div><div className="mt-1 text-xl font-bold text-zinc-900">{data.metrics.indexed_docs}</div></div>
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3"><div className="text-zinc-500 font-medium">Open risks</div><div className="mt-1 text-xl font-bold text-zinc-900">{data.metrics.open_risks}</div></div>
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3"><div className="text-zinc-500 font-medium">Today&apos;s chats</div><div className="mt-1 text-xl font-bold text-zinc-900">{data.metrics.today_chats}</div></div>
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3"><div className="text-zinc-500 font-medium">Interviews</div><div className="mt-1 text-xl font-bold text-zinc-900">{data.metrics.interviews}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacious 4-column Stat Metrics */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Knowledge objects" value={String(data.metrics.indexed_docs)} delta="+8 this week" hint="Docs, incidents, and extracted entities" tone="blue" updated="Updated now" trend={{label:'+8', direction:'up'}} recentActivity="Live catalog count" />
        <StatCard label="Compliance score" value={data.metrics.compliance_score} delta="+1.4%" hint="Weighted across active equipment" tone="green" updated="Updated now" trend={{label:'+1.4%', direction:'up'}} recentActivity="Calculated dynamically" />
        <StatCard label="Open alerts" value={String(data.metrics.open_risks)} delta="0 critical" hint="Needs immediate review" tone="amber" updated="Updated now" trend={{label:'0', direction:'down'}} recentActivity="Pattern-match alerts" />
        <StatCard label="Captured interviews" value={String(data.metrics.interviews)} delta="+0" hint="Guided sessions saved" tone="violet" updated="Updated now" trend={{label:'0', direction:'up'}} recentActivity="Tacit knowledge sessions" />
      </section>


      {/* Middle row: Actions & Live Risks */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="card space-y-5">
          <SectionHeader eyebrow="Next best actions" title="What to do next" description="The workspace highlights the highest-value actions so operators can move from insight to execution without searching for the right page." />
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => <LinkCard key={action.href} {...action} />)}
          </div>
        </div>

        <div className="card space-y-5">
          <SectionHeader eyebrow="Live signal" title="Risk snapshot" description="A lightweight operational view of what needs attention right now." />
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-amber-50 border border-amber-200/60 px-4 py-3 text-amber-800 animate-pulse">
              <span className="font-semibold text-sm">Humidity drift in Zone 3</span>
              <StatusPill tone="amber">High risk</StatusPill>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-pastel-500/10 border border-pastel-500/20 px-4 py-3 text-pastel-750">
              <span className="font-semibold text-sm">Manual revision pending</span>
              <StatusPill tone="blue">Review</StatusPill>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200/60 px-4 py-3 text-emerald-800">
              <span className="font-semibold text-sm">Interview packet ready</span>
              <StatusPill tone="green">Ready</StatusPill>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom row: Activity & Pinned Views */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card">
          <div className="flex items-center justify-between gap-4">
            <SectionHeader eyebrow="Activity" title="Recent activity" description="Follow the latest platform events, from ingestion to compliance findings and guided interviews." />
            <Link href="/alerts" className="hidden items-center gap-2 text-sm font-semibold text-pastel-700 hover:text-pastel-600 md:inline-flex">
              Open alerts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5">
            <Timeline items={data.activity} />
          </div>

        </div>

        <div className="card space-y-4">
          <SectionHeader eyebrow="Suggested" title="Suggested actions" description="A short list of high-confidence tasks to keep the team moving." />
          <div className="space-y-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <Clock3 className="h-4 w-4 text-pastel-700" />
                Review the latest risk spike
              </div>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">Open the compliance dashboard and inspect the humidity-control evidence trail.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <Gauge className="h-4 w-4 text-pastel-700" />
                Run a guided interview
              </div>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">Capture tacit knowledge from a site expert before the next maintenance window.</p>
            </div>
          </div>
          <EmptyState
            title="No pinned workspace views yet"
            description="Pin the pages, incidents, or equipment groups your team checks every day to turn the dashboard into a personal command center."
            primaryAction={<Link href="/chat" className="ui-button text-xs font-semibold">Ask the copilot</Link>}
            secondaryAction={<Link href="/ingest" className="ui-button-secondary text-xs font-semibold">Upload knowledge</Link>}
            illustration="diagram"
          />
        </div>
      </section>
    </div>
  )
}

Dashboard.pageMeta = { title: 'Enterprise Workspace', description: 'Command center for knowledge, incidents, compliance, and AI-assisted operations.', breadcrumbs: ['Workspace'] }
