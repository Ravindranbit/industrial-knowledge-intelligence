import '../styles/globals.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, LayoutDashboard, MessageSquare, ShieldCheck, ListChecks, BellRing, UploadCloud, Cpu } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Workspace', icon: LayoutDashboard },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { href: '/interview', label: 'Interview', icon: ListChecks },
  { href: '/alerts', label: 'Alerts', icon: BellRing },
  { href: '/ingest', label: 'Upload', icon: UploadCloud },
]

const routeMeta = {
  '/': { title: 'Industrial Knowledge AI', description: 'Grounded operations & compliance platform.', breadcrumbs: ['Landing'] },
  '/dashboard': { title: 'Enterprise Workspace', description: 'Command center for knowledge, incidents, compliance, and AI-assisted operations.', breadcrumbs: ['Workspace'] },
  '/chat': { title: 'AI Chat', description: 'Ask operational questions, inspect sources, and keep context across every answer.', breadcrumbs: ['Workspace', 'AI Chat'] },
  '/compliance': { title: 'Compliance Monitoring', description: 'Track risk, review evidence, and drill into policy status across assets.', breadcrumbs: ['Workspace', 'Compliance'] },
  '/interview': { title: 'Guided Interview', description: 'Capture tacit knowledge with a stepwise workflow and progress tracking.', breadcrumbs: ['Workspace', 'Interview'] },
  '/alerts': { title: 'Operations Center', description: 'Monitor live alerts, severity trends, and linked historical incidents.', breadcrumbs: ['Workspace', 'Alerts'] },
  '/ingest': { title: 'Document Intake', description: 'Drag, drop, and process documents through an ingestion workflow.', breadcrumbs: ['Workspace', 'Upload'] },
}

function SidebarItem({ href, icon: Icon, children, active }) {
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${active ? 'bg-pastel-600 text-white shadow-md shadow-pastel-600/15' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </Link>
  )
}

function Layout({ children, meta }) {
  const router = useRouter()
  const isLandingPage = router.pathname === '/'
  const currentMeta = meta || routeMeta[router.pathname] || routeMeta['/dashboard']

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <AnimatePresence mode="wait">
          <motion.div key={router.asPath} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </AnimatePresence>
        <Toaster position="top-right" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100/40 text-zinc-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-zinc-200 bg-white px-4 py-5 backdrop-blur-md xl:flex">
          <div className="mb-6 rounded-2xl bg-zinc-50 border border-zinc-200 px-4 py-3.5 text-zinc-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pastel-50 border border-pastel-100 text-pastel-700 shadow-sm">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight text-zinc-900 leading-tight">IKI Copilot</div>
                <div className="text-[10px] font-medium text-zinc-500">Industrial Operations Suite</div>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <SidebarItem key={item.href} href={item.href} icon={item.icon} active={router.pathname === item.href}>
                {item.label}
              </SidebarItem>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">System status</div>
            <div className="mt-3 space-y-3 text-xs text-zinc-650">
              <div className="flex items-center justify-between"><span>Knowledge graph</span><span className="font-semibold text-emerald-650">Healthy</span></div>
              <div className="flex items-center justify-between"><span>Vector index</span><span className="font-semibold text-emerald-650">Synced</span></div>
              <div className="flex items-center justify-between"><span>Alert stream</span><span className="font-semibold text-amber-650">2 open</span></div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
            <div className="flex flex-col gap-4 px-4 py-4 xl:px-8">
              <div className="flex items-center gap-2.5 xl:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pastel-50 border border-pastel-100 text-pastel-700 shadow-sm">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-tight text-zinc-900 leading-tight">IKI Copilot</div>
                  <div className="text-[9px] font-medium text-zinc-550">Industrial Operations Suite</div>
                </div>
              </div>

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {currentMeta.breadcrumbs?.map((crumb, index) => (
                      <span key={crumb} className="flex items-center gap-2">
                        {index > 0 && <span className="text-zinc-305">/</span>}
                        <span>{crumb}</span>
                      </span>
                    ))}
                  </div>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">{currentMeta.title}</h1>
                  <p className="mt-1 max-w-3xl text-xs text-zinc-500">{currentMeta.description}</p>
                </div>

                <div className="flex flex-col gap-3 xl:min-w-[520px] xl:flex-row xl:items-center xl:justify-end">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      aria-label="Search workspace"
                      placeholder="Search documents, incidents, rules, or actions"
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-xs outline-none ring-0 transition placeholder:text-zinc-400 focus:border-pastel-500/50 focus:ring-4 focus:ring-pastel-500/10 text-zinc-900"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pastel-600 text-[10px] font-bold text-white shadow-md shadow-pastel-600/20">AI</div>
                    <div>
                      <div className="font-semibold text-zinc-800">Operations Copilot</div>
                      <div className="text-[10px] text-zinc-500">Online • 99.9% available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200/80 bg-white/80 px-4 py-3 xl:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap ${router.pathname === item.href ? 'bg-pastel-600 text-white shadow-md shadow-pastel-600/20' : 'bg-zinc-50 text-zinc-550 border border-zinc-200 hover:text-zinc-900 hover:bg-zinc-105'}`}>
                    <item.icon className="h-3.5 w-3.5" />
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

