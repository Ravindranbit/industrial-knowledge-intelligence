import '../styles/globals.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, LayoutDashboard, MessageSquare, ShieldCheck, ListChecks, BellRing, UploadCloud, SlidersHorizontal } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Workspace', icon: LayoutDashboard },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { href: '/interview', label: 'Interview', icon: ListChecks },
  { href: '/alerts', label: 'Alerts', icon: BellRing },
  { href: '/ingest', label: 'Upload', icon: UploadCloud },
]

const routeMeta = {
  '/': { title: 'Enterprise Workspace', description: 'Command center for knowledge, incidents, compliance, and AI-assisted operations.', breadcrumbs: ['Workspace'] },
  '/chat': { title: 'AI Chat', description: 'Ask operational questions, inspect sources, and keep context across every answer.', breadcrumbs: ['Workspace', 'AI Chat'] },
  '/compliance': { title: 'Compliance Monitoring', description: 'Track risk, review evidence, and drill into policy status across assets.', breadcrumbs: ['Workspace', 'Compliance'] },
  '/interview': { title: 'Guided Interview', description: 'Capture tacit knowledge with a stepwise workflow and progress tracking.', breadcrumbs: ['Workspace', 'Interview'] },
  '/alerts': { title: 'Operations Center', description: 'Monitor live alerts, severity trends, and linked historical incidents.', breadcrumbs: ['Workspace', 'Alerts'] },
  '/ingest': { title: 'Document Intake', description: 'Drag, drop, and process documents through an ingestion workflow.', breadcrumbs: ['Workspace', 'Upload'] },
}

function SidebarItem({ href, icon: Icon, children, active }) {
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${active ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </Link>
  )
}

function Layout({ children, meta }) {
  const router = useRouter()
  const currentMeta = meta || routeMeta[router.pathname] || routeMeta['/']

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/90 px-4 py-5 backdrop-blur xl:flex">
          <div className="mb-6 rounded-2xl bg-slate-950 px-4 py-4 text-white shadow-lg shadow-slate-900/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">IK</div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Industrial Knowledge</div>
                <div className="text-lg font-semibold">Enterprise AI Suite</div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              Connected to ingestion, compliance, interview, alerts, and chat workflows.
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <SidebarItem key={item.href} href={item.href} icon={item.icon} active={router.pathname === item.href}>
                {item.label}
              </SidebarItem>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">System status</div>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Knowledge graph</span><span className="font-semibold text-emerald-600">Healthy</span></div>
              <div className="flex items-center justify-between"><span>Vector index</span><span className="font-semibold text-emerald-600">Synced</span></div>
              <div className="flex items-center justify-between"><span>Alert stream</span><span className="font-semibold text-amber-600">2 open</span></div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 xl:px-8">
              <div className="flex items-center gap-3 xl:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">IK</div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Industrial Knowledge</div>
                  <div className="text-base font-semibold text-slate-900">Enterprise AI Suite</div>
                </div>
              </div>

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                    {currentMeta.breadcrumbs?.map((crumb, index) => (
                      <span key={crumb} className="flex items-center gap-2">
                        {index > 0 && <span className="text-slate-300">/</span>}
                        <span>{crumb}</span>
                      </span>
                    ))}
                  </div>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{currentMeta.title}</h1>
                  <p className="mt-1 max-w-3xl text-sm text-slate-600">{currentMeta.description}</p>
                </div>

                <div className="flex flex-col gap-3 xl:min-w-[520px] xl:flex-row xl:items-center xl:justify-end">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      aria-label="Search workspace"
                      placeholder="Search documents, incidents, rules, or actions"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">AI</div>
                    <div>
                      <div className="font-medium text-slate-900">Operations Copilot</div>
                      <div className="text-xs text-slate-500">Online • 99.9% available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 xl:px-8 xl:hidden">
              <div className="flex gap-2 overflow-x-auto">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${router.pathname === item.href ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 shadow-sm border border-slate-200'}`}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 xl:px-8">
            <AnimatePresence mode="wait">
              <motion.div key={router.asPath} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default function App({ Component, pageProps }) {
  return <Layout meta={Component.pageMeta}>{<Component {...pageProps} />}</Layout>
}
