import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Info, Bell, Gauge, Activity, Clock3, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { EmptyState, SectionHeader, StatCard, StatusPill, Timeline, SkeletonList } from '../components/enterprise-ui'

function AlertIcon({level}){
  if(level==='critical') return <AlertTriangle className="w-5 h-5 text-red-600" />
  if(level==='warning') return <Bell className="w-5 h-5 text-yellow-500" />
  return <Info className="w-5 h-5 text-blue-500" />
}

export default function Alerts(){
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const severitySummary = useMemo(() => {
    const total = alerts.length || 1
    const critical = alerts.filter((alert) => alert.severity === 'critical').length
    const warning = alerts.filter((alert) => alert.severity === 'warning').length
    return {
      critical,
      warning,
      healthy: Math.max(total - critical - warning, 0),
    }
  }, [alerts])

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch('/api/proxy-alerts')
        const data = await res.json()
        setAlerts(data.alerts || [])
      }catch(err){
        setAlerts([])
      }finally{
        setLoading(false)
      }
    }
    load()
  },[])

  return (
    <div className="space-y-6">
      {/* Top row: Header & Stats grid de-nested */}
      <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1 max-w-3xl">
          <SectionHeader
            eyebrow="Operations"
            title="Alert operations center"
            description="Monitor severity levels, follow timestamps, and jump directly into the related incident or investigation workflow."
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusPill tone="red">{severitySummary.critical} critical</StatusPill>
            <StatusPill tone="amber">{severitySummary.warning} warning</StatusPill>
            <StatusPill tone="green">{severitySummary.healthy} stable</StatusPill>
          </div>
        </div>
        <div className="grid w-full gap-4 sm:grid-cols-3 xl:w-[680px]">
          <StatCard label="Critical alerts" value={severitySummary.critical} delta="Requires action" hint="Immediate triage" tone="amber" updated="Updated now" trend={{label:'Critical', direction:'down'}} recentActivity="Live feed" />
          <StatCard label="Warning alerts" value={severitySummary.warning} delta="Monitor" hint="Follow-up recommended" tone="blue" updated="Updated 2m ago" trend={{label:'Watch', direction:'flat'}} recentActivity="1 escalating" />
          <StatCard label="Resolved" value={severitySummary.healthy} delta="Stable" hint="No escalation" tone="green" updated="Updated 5m ago" trend={{label:'Healthy', direction:'up'}} recentActivity="3 events closed" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <Gauge className="h-4 w-4 text-pastel-700" />
              Severity trend
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-zinc-550"><span>Critical</span><span>62%</span></div>
                <div className="h-2 rounded-full bg-zinc-150"><div className="h-2 w-[62%] rounded-full bg-rose-500" /></div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-zinc-550"><span>Warning</span><span>54%</span></div>
                <div className="h-2 rounded-full bg-zinc-150"><div className="h-2 w-[54%] rounded-full bg-amber-500" /></div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-zinc-550"><span>Info</span><span>78%</span></div>
                <div className="h-2 rounded-full bg-zinc-150"><div className="h-2 w-[78%] rounded-full bg-blue-500" /></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <Activity className="h-4 w-4 text-pastel-700" />
              Recent response activity
            </div>
            <div className="mt-4">
              <Timeline
                items={[
                  { title: 'Alert created', description: 'Humidity drift detected in Zone 3.', meta: '3 minutes ago', dot: 'bg-rose-500' },
                  { title: 'Acknowledged by operator', description: 'Assigned to the on-call facilities engineer.', meta: '2 minutes ago', dot: 'bg-amber-500' },
                  { title: 'Follow-up inspection scheduled', description: 'Review linked incident and verify sensor calibration.', meta: 'Pending', dot: 'bg-zinc-400' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading && <SkeletonList rows={3} />}

          {!loading && alerts.length===0 && (
            <EmptyState
              title="No alerts yet"
              description="When the system detects a risk, it appears here with severity, timestamp, and context so operators can respond quickly."
              primaryAction={<Link href="/compliance" className="ui-button text-xs font-semibold">Review compliance</Link>}
              secondaryAction={<Link href="/chat" className="ui-button-secondary text-xs font-semibold">Ask the copilot</Link>}
              illustration="pulse"
            />
          )}

          <div className="space-y-3">
            {alerts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <li className="card flex items-start gap-4 list-none">
                  <div>{a.severity === 'critical' ? <AlertTriangle className="h-5 w-5 text-rose-500" /> : a.severity === 'warning' ? <Bell className="h-5 w-5 text-amber-500" /> : <Info className="h-5 w-5 text-blue-500" />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="font-semibold text-zinc-900">{a.title || 'Alert'}</div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500"><Clock3 className="h-3.5 w-3.5" />{a.timestamp}</div>
                    </div>
                    <div className="mt-1.5 text-xs leading-relaxed text-zinc-550">{a.summary}</div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/80 pt-3">
                      <StatusPill tone={a.severity === 'critical' ? 'red' : a.severity === 'warning' ? 'amber' : 'blue'}>{a.severity || 'info'}</StatusPill>
                      <Link href="/chat" className="inline-flex items-center gap-2 text-xs font-semibold text-pastel-700 hover:text-pastel-600 transition hover:gap-2.5">Investigate with copilot <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </div>
                  </div>
                </li>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

Alerts.pageMeta = { title: 'Operations Center', description: 'Monitor live alerts, severity trends, and linked historical incidents.', breadcrumbs: ['Workspace', 'Alerts'] }

