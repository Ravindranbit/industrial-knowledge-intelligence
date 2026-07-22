import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Shield, TrendingUp, Activity, Clock3, Search } from 'lucide-react'
import { EmptyState, SectionHeader, StatCard, StatusPill, Timeline, SkeletonList } from '../components/enterprise-ui'

function RuleRow({ ev }) {
  const status = ev.passed ? 'Pass' : 'Fail'
  const tone = ev.passed ? 'green' : 'red'
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{ev.rule_ref || ev.rule}</div>
          <div className="mt-1 text-sm text-slate-600">{ev.summary}</div>
        </div>
        <StatusPill tone={tone}>{status}</StatusPill>
      </div>
      {ev.reasoning && <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{ev.reasoning}</div>}
    </div>
  )
}

function MiniBarChart({ items = [] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="text-slate-500">{item.value}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Compliance() {
  const [id, setId] = useState('CRAC-3')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function check(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/proxy-compliance?equipment_id=${encodeURIComponent(id)}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const evaluations = result?.evaluations || []
  const passCount = evaluations.filter((item) => item.passed).length
  const failCount = evaluations.filter((item) => !item.passed).length
  const riskItems = [
    { label: 'Evidence quality', value: 86, color: 'bg-emerald-500' },
    { label: 'Policy alignment', value: 71, color: 'bg-blue-500' },
    { label: 'Residual risk', value: 42, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-6">
      <section className="card grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
        <div>
          <SectionHeader
            eyebrow="Monitoring"
            title="Compliance monitoring dashboard"
            description="Inspect equipment posture, compare rule outcomes, and follow a clear evidence trail instead of reading isolated form responses."
          />
          <form onSubmit={check} className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Equipment ID (e.g., CRAC-3)" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
            </div>
            <button onClick={check} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
              {loading ? 'Checking...' : 'Check compliance'}
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill tone="blue">Active equipment review</StatusPill>
            <StatusPill tone="amber">2 findings need attention</StatusPill>
            <StatusPill tone="green">Evidence linked</StatusPill>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Policy score" value="92%" delta="+1.2%" hint="Weighted by current evidence" tone="green" updated="Updated 7m ago" trend={{label:'+1.2%', direction:'up'}} recentActivity="Latest review completed" />
          <StatCard label="Open findings" value={failCount || '3'} delta={failCount ? `${failCount} unresolved` : '2 critical'} hint="Tracked across the selected asset" tone="amber" updated="Updated just now" trend={{label: failCount ? 'Review' : 'Stable', direction: failCount ? 'down' : 'flat'}} recentActivity="Waiting on evidence" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          <div className="card space-y-4">
            <SectionHeader eyebrow="Risk indicators" title="Current posture" description="A compact view of the system state for the selected equipment." />
            <MiniBarChart items={riskItems} />
          </div>

          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Activity className="h-4 w-4 text-blue-600" />History</div>
            <div className="mt-4">
              <Timeline
                items={[
                  { title: 'Policy check completed', description: 'Latest rules validated against the selected equipment.', meta: '5 minutes ago', dot: 'bg-emerald-500' },
                  { title: 'Sensor drift detected', description: 'Humidity variance exceeded the configured threshold.', meta: 'Today • 08:10 UTC', dot: 'bg-amber-500' },
                  { title: 'Follow-up evidence requested', description: 'Operations team asked to upload the latest maintenance log.', meta: 'Yesterday', dot: 'bg-blue-500' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!result && (
            <EmptyState
              title="Run a compliance check"
              description="Enter an equipment identifier to review pass/fail results, reasoning traces, and the next best action for the operator."
              primaryAction={<button onClick={check} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Check now</button>}
              secondaryAction={<button onClick={() => setId('CRAC-3')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Use CRAC-3</button>}
              illustration="diagram"
            />
          )}

          {loading && !result && <SkeletonList rows={3} />}

          {result?.evaluations && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Checks passed" value={passCount} delta={`${evaluations.length || 0} evaluated`} hint="Positive findings" tone="green" updated="Updated now" trend={{label:'+0', direction:'flat'}} recentActivity="No new pass items" />
                <StatCard label="Checks failed" value={failCount} delta="Needs review" hint="Requires evidence or action" tone="amber" updated="Updated now" trend={{label: failCount ? `${failCount}` : '0', direction: failCount ? 'down' : 'flat'}} recentActivity={failCount ? 'Findings need triage' : 'Clear'} />
                <StatCard label="Risk level" value={failCount > 0 ? 'Elevated' : 'Low'} delta={failCount > 2 ? 'Escalate' : 'Monitor'} hint="Based on open findings" tone={failCount > 0 ? 'amber' : 'green'} updated="Updated now" trend={{label: failCount > 0 ? 'Watch' : 'Low', direction: failCount > 0 ? 'down' : 'flat'}} recentActivity="Monitoring continues" />
              </div>
              <div className="grid gap-4">
                {result.evaluations.map((ev, i) => <RuleRow key={i} ev={ev} />)}
              </div>
            </div>
          )}

          {result && !result.evaluations && (
            <div className="card">
              <pre className="overflow-auto text-sm text-slate-700">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

Compliance.pageMeta = { title: 'Compliance Monitoring', description: 'Track risk, review evidence, and drill into policy status across assets.', breadcrumbs: ['Workspace', 'Compliance'] }
