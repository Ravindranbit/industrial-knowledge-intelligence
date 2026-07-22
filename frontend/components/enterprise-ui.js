import Link from 'next/link'
import { ChevronRight, Circle, Sparkles, ArrowUpRight, Clock3 } from 'lucide-react'

export function StatCard({ label, value, delta, hint, tone = 'blue', updated, trend, recentActivity, icon: Icon }) {
  const toneClasses = {
    blue: 'from-blue-50 to-cyan-50 border-blue-100',
    green: 'from-emerald-50 to-teal-50 border-emerald-100',
    amber: 'from-amber-50 to-orange-50 border-amber-100',
    violet: 'from-violet-50 to-fuchsia-50 border-violet-100',
  }

  const trendTone = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-rose-600 bg-rose-50',
    flat: 'text-slate-600 bg-slate-100',
  }

  return (
    <div className={`card group relative overflow-hidden bg-gradient-to-br ${toneClasses[tone]} min-h-[176px]`}>
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
            </div>
            {Icon && <div className="rounded-2xl bg-white/80 p-2.5 text-slate-700 shadow-sm"><Icon className="h-5 w-5" /></div>}
          </div>
          {hint && <div className="mt-3 text-sm leading-6 text-slate-500">{hint}</div>}
        </div>

        <div className="space-y-3 border-t border-white/60 pt-4">
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-slate-700 shadow-sm">{delta || 'Live metric'}</span>
            {trend && <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${trendTone[trend.direction || 'flat'] || trendTone.flat}`}><ArrowUpRight className="h-3.5 w-3.5" />{trend.label}</span>}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            {updated ? <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{updated}</span> : <span>Updated recently</span>}
            {recentActivity && <span className="font-medium text-slate-600">{recentActivity}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700"><Sparkles className="h-3.5 w-3.5" />{eyebrow}</div>}
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-[2rem]">{title}</h2>
        {description && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-[15px]">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function EmptyState({ title, description, primaryAction, secondaryAction, illustration = 'diagram' }) {
  const glyphs = {
    diagram: (
      <svg viewBox="0 0 320 200" className="h-40 w-full text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="18" y="20" width="120" height="70" rx="14" className="fill-blue-50" />
        <rect x="182" y="24" width="120" height="52" rx="14" className="fill-cyan-50" />
        <rect x="70" y="118" width="180" height="48" rx="14" className="fill-violet-50" />
        <path d="M138 56h44M138 56l12 12M182 56l-12 12" />
        <circle cx="68" cy="50" r="10" />
        <circle cx="252" cy="50" r="10" />
        <circle cx="160" cy="142" r="10" />
      </svg>
    ),
    pulse: (
      <svg viewBox="0 0 320 200" className="h-40 w-full text-emerald-200" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="28" y="26" width="264" height="148" rx="20" className="fill-emerald-50" />
        <path d="M56 114h38l18-30 18 48 20-18 18-24 20 48 16-18h40" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="56" cy="114" r="6" />
        <circle cx="294" cy="114" r="6" />
      </svg>
    ),
  }

  return (
    <div className="card overflow-hidden">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <Circle className="h-2.5 w-2.5 fill-blue-500 text-blue-500" />
            Empty state
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {primaryAction}
            {secondaryAction}
          </div>
        </div>
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-4 shadow-sm">
          {glyphs[illustration] || glyphs.diagram}
        </div>
      </div>
    </div>
  )
}

export function StatusPill({ tone = 'slate', children }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    violet: 'bg-violet-50 text-violet-700',
  }
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>
}

export function PromptPills({ prompts = [], onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button key={prompt} onClick={() => onPick?.(prompt)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-100">
          {prompt}
        </button>
      ))}
    </div>
  )
}

export function Timeline({ items = [] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`mt-1 h-3 w-3 rounded-full ${item.dot || 'bg-blue-500'}`} />
            {index !== items.length - 1 && <div className="mt-2 h-full w-px flex-1 bg-slate-200" />}
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {item.title}
              {item.badge && <StatusPill tone={item.badgeTone || 'blue'}>{item.badge}</StatusPill>}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
            {item.meta && <div className="mt-2 text-xs text-slate-500">{item.meta}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function LinkCard({ href, title, description, meta, icon: Icon }) {
  return (
    <Link href={href} className="card group flex items-start gap-4 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
      <div className="rounded-2xl bg-blue-50 p-3 text-blue-700 transition duration-200 group-hover:bg-blue-100">
        {Icon ? <Icon className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold tracking-tight text-slate-900">{title}</h3>
          <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        {meta && <div className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{meta}</div>}
      </div>
    </Link>
  )
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-4">
      <div className="h-3 w-24 rounded-full bg-slate-200" />
      <div className="h-8 w-32 rounded-full bg-slate-200" />
      <div className="h-4 w-2/3 rounded-full bg-slate-200" />
      <div className="h-10 w-28 rounded-2xl bg-slate-200" />
    </div>
  )
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="card animate-pulse flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded-full bg-slate-200" />
            <div className="h-3 w-5/6 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
