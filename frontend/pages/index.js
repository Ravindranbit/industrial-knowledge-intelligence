import Link from 'next/link'
import { ArrowRight, FileText, ShieldAlert, MessageSquare, UploadCloud, Gauge, Plus, Clock3, Sparkles } from 'lucide-react'
import { StatCard, SectionHeader, LinkCard, Timeline, StatusPill, EmptyState } from '../components/enterprise-ui'

const activity = [
  { title: 'ASHRAE guidelines ingested', description: 'Document parsed, embedded, and linked to the knowledge graph.', meta: '2 hours ago • CRAC-3', dot: 'bg-blue-500' },
  { title: 'Interview completed with facility lead', description: 'Three follow-up answers captured and saved to the workflow log.', meta: 'Today • 11:20 UTC', dot: 'bg-emerald-500' },
  { title: 'New compliance risk surfaced', description: 'Humidity control policy drift detected on the north stack.', meta: 'Today • 09:55 UTC', dot: 'bg-amber-500' },
]

const quickActions = [
  { href: '/ingest', title: 'Upload a document', description: 'Ingest SOPs, manuals, or incident reports and watch them process end-to-end.', icon: UploadCloud, meta: 'Recommended next step' },
  { href: '/chat', title: 'Ask the copilot', description: 'Summarize incidents, compare rule sets, or trace an answer back to sources.', icon: MessageSquare, meta: 'Best for fast answers' },
  { href: '/compliance', title: 'Review risk', description: 'Check equipment posture, evidence gaps, and unresolved findings.', icon: ShieldAlert, meta: 'Operational insight' },
  { href: '/interview', title: 'Capture tacit knowledge', description: 'Step through guided questioning for technicians and site leads.', icon: FileText, meta: 'Workflow capture' },
]

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-850 bg-[#1C1917] p-6 text-white shadow-xl shadow-stone-950/15 xl:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Enterprise AI Operations
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight xl:text-4xl">
              Keep engineering, operations, and compliance in one guided workspace.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
              Review the current posture, upload new knowledge, ask the copilot for grounded answers, and move directly into the next best action.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/ingest" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-stone-900 shadow-md transition hover:-translate-y-0.5">
                <Plus className="h-4 w-4" />
                Start an intake
              </Link>
              <Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Open AI chat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Platform health</div>
                <div className="mt-1 text-lg font-semibold">All core services operational</div>
              </div>
              <StatusPill tone="green">Healthy</StatusPill>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
              <div className="rounded-2xl bg-white/5 p-3"><div className="text-slate-400">Indexed docs</div><div className="mt-1 text-2xl font-semibold">128</div></div>
              <div className="rounded-2xl bg-white/5 p-3"><div className="text-slate-400">Open risks</div><div className="mt-1 text-2xl font-semibold">3</div></div>
              <div className="rounded-2xl bg-white/5 p-3"><div className="text-slate-400">Today&apos;s chats</div><div className="mt-1 text-2xl font-semibold">42</div></div>
              <div className="rounded-2xl bg-white/5 p-3"><div className="text-slate-400">Interviews</div><div className="mt-1 text-2xl font-semibold">21</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Knowledge objects" value="128" delta="+8 this week" hint="Docs, incidents, and extracted entities" tone="blue" updated="Updated 5m ago" trend={{label:'+6.5%', direction:'up'}} recentActivity="3 new docs indexed" />
        <StatCard label="Compliance score" value="92%" delta="+1.4%" hint="Weighted across active equipment" tone="green" updated="Updated 12m ago" trend={{label:'+1.4%', direction:'up'}} recentActivity="North stack improved" />
        <StatCard label="Open alerts" value="3" delta="2 critical" hint="Needs immediate review" tone="amber" updated="Updated now" trend={{label:'-1', direction:'down'}} recentActivity="1 escalated today" />
        <StatCard label="Captured interviews" value="21" delta="+4" hint="Guided sessions saved" tone="violet" updated="Updated 1h ago" trend={{label:'+4', direction:'up'}} recentActivity="2 sessions completed" />
      </section>

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
            <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3"><span className="font-medium text-amber-900">Humidity drift in Zone 3</span><StatusPill tone="amber">High risk</StatusPill></div>
            <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3"><span className="font-medium text-blue-900">Manual revision pending</span><StatusPill tone="blue">Review</StatusPill></div>
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3"><span className="font-medium text-emerald-900">Interview packet ready</span><StatusPill tone="green">Ready</StatusPill></div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card">
          <div className="flex items-center justify-between gap-4">
            <SectionHeader eyebrow="Activity" title="Recent activity" description="Follow the latest platform events, from ingestion to compliance findings and guided interviews." />
            <Link href="/alerts" className="hidden items-center gap-2 text-sm font-semibold text-blue-700 md:inline-flex">
              Open alerts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5">
            <Timeline items={activity} />
          </div>
        </div>

        <div className="card space-y-4">
          <SectionHeader eyebrow="Suggested" title="Suggested actions" description="A short list of high-confidence tasks to keep the team moving." />
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Clock3 className="h-4 w-4 text-blue-600" />Review the latest risk spike</div>
              <p className="mt-1 text-sm text-slate-600">Open the compliance dashboard and inspect the humidity-control evidence trail.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Gauge className="h-4 w-4 text-blue-600" />Run a guided interview</div>
              <p className="mt-1 text-sm text-slate-600">Capture tacit knowledge from a site expert before the next maintenance window.</p>
            </div>
          </div>
          <EmptyState
            title="No pinned workspace views yet"
            description="Pin the pages, incidents, or equipment groups your team checks every day to turn the dashboard into a personal command center."
            primaryAction={<Link href="/chat" className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Ask the copilot</Link>}
            secondaryAction={<Link href="/ingest" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Upload knowledge</Link>}
            illustration="diagram"
          />
        </div>
      </section>
    </div>
  )
}

Home.pageMeta = { title: 'Enterprise Workspace', description: 'Command center for knowledge, incidents, compliance, and AI-assisted operations.', breadcrumbs: ['Workspace'] }
