import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Shield, TrendingUp, Activity, Clock3, Search } from 'lucide-react'
import { EmptyState, SectionHeader, StatCard, StatusPill, Timeline, SkeletonList } from '../components/enterprise-ui'

function RuleRow({ ev }) {
  const status = ev.passed ? 'Pass' : 'Fail'
  const tone = ev.passed ? 'green' : 'red'
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-zinc-900">{ev.rule_ref || ev.rule}</div>
          <div className="mt-1.5 text-xs text-zinc-550 leading-relaxed">{ev.summary}</div>
        </div>
        <StatusPill tone={tone}>{status}</StatusPill>
      </div>
      {ev.reasoning && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600">
          {ev.reasoning}
        </div>
      )}
    </div>
  )
}

function MiniBarChart({ items = [] }) {
  return (
    <div className="space-y-3.5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-650">{item.label}</span>
            <span className="text-zinc-500">{item.value}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-150">
            <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
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
    { label: 'Policy alignment', value: 71, color: 'bg-pastel-600' },
    { label: 'Residual risk', value: 42, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header & Search Area - Borderless layout */}
      <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl flex-1">
          <SectionHeader
            eyebrow="Monitoring"
            title="Compliance monitoring dashboard"
            description="Inspect equipment posture, compare rule outcomes, and follow a clear evidence trail instead of reading isolated form responses."
          />
          <form onSubmit={check} className="mt-6 flex flex-col gap-3 sm:flex-row max-w-xl">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Equipment ID (e.g., CRAC-3)" className="ui-input pl-11 text-xs" />
            </div>
            <button onClick={check} className="ui-button text-xs whitespace-nowrap" disabled={loading}>
              {loading ? 'Checking...' : 'Check compliance'}
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill tone="blue">Active equipment review</StatusPill>
            <StatusPill tone="amber">2 findings need attention</StatusPill>
            <StatusPill tone="green">Evidence linked</StatusPill>
          </div>
        </div>

        {/* Core Stats Side-Grid */}
        <div className="grid w-full gap-4 sm:grid-cols-2 xl:w-[480px]">
          <StatCard label="Policy score" value="92%" delta="+1.2%" hint="Weighted by current evidence" tone="green" updated="Updated 7m ago" trend={{label:'+1.2%', direction:'up'}} recentActivity="Latest review completed" />
          <StatCard label="Open findings" value={failCount || '3'} delta={failCount ? `${failCount} unresolved` : '2 critical'} hint="Tracked across active asset" tone="amber" updated="Updated just now" trend={{label: failCount ? 'Review' : 'Stable', direction: failCount ? 'down' : 'flat'}} recentActivity="Waiting on evidence" />
        </div>
      </section>

      {/* Main Results Grid */}
      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          <div className="card space-y-4">
            <SectionHeader eyebrow="Risk indicators" title="Current posture" description="A compact view of the system state for the selected equipment." />
            <MiniBarChart items={riskItems} />
          </div>

          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <Activity className="h-4 w-4 text-pastel-700 animate-pulse" />
              History
            </div>
            <div className="mt-4">
              <Timeline
                items={[
                  { title: 'Policy check completed', description: 'Latest rules validated against the selected equipment.', meta: '5 minutes ago', dot: 'bg-emerald-500' },
                  { title: 'Sensor drift detected', description: 'Humidity variance exceeded the configured threshold.', meta: 'Today • 08:10 UTC', dot: 'bg-amber-500' },
                  { title: 'Follow-up evidence requested', description: 'Operations team asked to upload the latest maintenance log.', meta: 'Yesterday', dot: 'bg-pastel-600' },
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
              primaryAction={<button onClick={check} className="ui-button text-xs">Check now</button>}
              secondaryAction={<button onClick={() => setId('CRAC-3')} className="ui-button-secondary text-xs">Use CRAC-3</button>}
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
                {result.evaluations.map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                  >
                    <RuleRow ev={ev} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {result && !result.evaluations && (
            <div className="card">
              <pre className="overflow-auto text-xs text-zinc-650 bg-zinc-50 p-4 rounded-2xl border border-zinc-250/50 leading-relaxed">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

Compliance.pageMeta = { title: 'Compliance Monitoring', description: 'Track risk, review evidence, and drill into policy status across assets.', breadcrumbs: ['Workspace', 'Compliance'] }

