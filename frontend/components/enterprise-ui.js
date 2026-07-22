import Link from 'next/link'
import { ChevronRight, Circle, ArrowUpRight, Clock3 } from 'lucide-react'

export function StatCard({ label, value, delta, hint, tone = 'blue', updated, trend, recentActivity, icon: Icon }) {
  const toneClasses = {
    blue: 'from-pastel-50/50 to-emerald-50/30 border-pastel-200/60 text-pastel-750 shadow-pastel-500/5',
    green: 'from-teal-50/50 to-emerald-50/30 border-emerald-200/60 text-emerald-750 shadow-emerald-500/5',
    amber: 'from-amber-50/50 to-orange-50/30 border-amber-200/60 text-amber-850 shadow-amber-500/5',
    violet: 'from-purple-50/50 to-violet-50/30 border-violet-200/60 text-purple-750 shadow-purple-500/5',
  }

  const trendTone = {
    up: 'text-emerald-700 bg-emerald-50 border-emerald-250/50',
    down: 'text-rose-700 bg-rose-50 border-rose-250/50',
    flat: 'text-zinc-600 bg-zinc-50 border-zinc-250/50',
  }

  return (
    <div className={`card group relative overflow-hidden bg-gradient-to-br ${toneClasses[tone]} flex flex-col justify-between gap-4 p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{value}</div>
        </div>
        {Icon ? (
          <div className="rounded-2xl bg-white border border-zinc-200 p-2.5 text-zinc-700 shadow-sm"><Icon className="h-5 w-5" /></div>
        ) : trend ? (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${trendTone[trend.direction || 'flat'] || trendTone.flat}`}>
            <ArrowUpRight className="h-3 w-3" />
            {trend.label}
          </span>
        ) : null}
      </div>

      {hint && <div className="text-xs text-zinc-650 leading-relaxed -mt-1">{hint}</div>}

      {(delta || updated || recentActivity) && (
        <div className="space-y-2.5 border-t border-zinc-200/60 pt-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium text-zinc-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-2 py-0.5 text-zinc-600">{delta || 'Live metric'}</span>
            {trend && !Icon && <span className="text-zinc-500">Active</span>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500">
            {updated ? <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{updated}</span> : <span>Updated recently</span>}
            {recentActivity && <span className="font-semibold text-zinc-600">{recentActivity}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="inline-flex items-center gap-2 rounded-full border border-pastel-200/60 bg-pastel-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-pastel-750">
            <span className="h-1.5 w-1.5 rounded-full bg-pastel-500" />
            {eyebrow}
          </div>
        )}
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 md:text-[2rem]">{title}</h2>
        {description && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function EmptyState({ title, description, primaryAction, secondaryAction, illustration = 'diagram' }) {
  const glyphs = {
    diagram: (
      <svg viewBox="0 0 320 200" className="h-40 w-full text-pastel-500/40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="18" y="20" width="120" height="70" rx="14" className="fill-pastel-50/50 stroke-pastel-500/20" />
        <rect x="182" y="24" width="120" height="52" rx="14" className="fill-cyan-50/50 stroke-cyan-500/20" />
        <rect x="70" y="118" width="180" height="48" rx="14" className="fill-purple-50/50 stroke-purple-500/20" />
        <path d="M138 56h44M138 56l12 12M182 56l-12 12" />
        <circle cx="68" cy="50" r="10" />
        <circle cx="252" cy="50" r="10" />
        <circle cx="160" cy="142" r="10" />
      </svg>
    ),
    pulse: (
      <svg viewBox="0 0 320 200" className="h-40 w-full text-emerald-500/40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="28" y="26" width="264" height="148" rx="20" className="fill-emerald-50/50 stroke-emerald-500/20" />
        <path d="M56 114h38l18-30 18 48 20-18 18-24 20 48 16-18h40" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="56" cy="114" r="6" />
        <circle cx="294" cy="114" r="6" />
      </svg>
    ),
  }

  return (
    <div className="card overflow-hidden bg-white border border-zinc-200/80 shadow-2xl">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 border border-zinc-200/80 px-3 py-1 text-xs font-semibold text-zinc-550">
            <Circle className="h-2.5 w-2.5 fill-pastel-500 text-pastel-500" />
            Workspace
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900">{title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">{description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {primaryAction}
            {secondaryAction}
          </div>
        </div>
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4 shadow-inner">
          {glyphs[illustration] || glyphs.diagram}
        </div>
      </div>
    </div>
  )
}

export function StatusPill({ tone = 'slate', children }) {
  const tones = {
    slate: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
    blue: 'bg-pastel-50 text-pastel-750 border border-pastel-200/50',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
    amber: 'bg-amber-50 text-amber-805 text-amber-800 border border-amber-200/50',
    red: 'bg-rose-50 text-rose-700 border border-rose-200/50',
    violet: 'bg-purple-50 text-purple-700 border border-purple-200/50',
  }
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${tones[tone] || tones.slate}`}>{children}</span>
}

export function PromptPills({ prompts = [], onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button key={prompt} onClick={() => onPick?.(prompt)} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-650 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-pastel-500 hover:bg-pastel-50 hover:text-pastel-700 focus-visible:ring-4 focus-visible:ring-pastel-500/10">
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
            <div className={`mt-1 h-3 w-3 rounded-full ${item.dot || 'bg-pastel-600'}`} />
            {index !== items.length - 1 && <div className="mt-2 h-full w-px flex-1 bg-zinc-200" />}
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              {item.title}
              {item.badge && <StatusPill tone={item.badgeTone || 'blue'}>{item.badge}</StatusPill>}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">{item.description}</p>
            {item.meta && <div className="mt-2 text-xs text-zinc-500">{item.meta}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function LinkCard({ href, title, description, meta, icon: Icon }) {
  return (
    <Link href={href} className="card group flex items-start gap-4 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl hover:border-zinc-300/80">
      <div className="rounded-2xl bg-pastel-50 border border-pastel-200/60 p-3 text-pastel-700 transition duration-200 group-hover:bg-pastel-600 group-hover:text-white">
        {Icon ? <Icon className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold tracking-tight text-zinc-900">{title}</h3>
          <ChevronRight className="h-4 w-4 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-pastel-600" />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>
        {meta && <div className="mt-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-pastel-750">{meta}</div>}
      </div>
    </Link>
  )
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-4 bg-zinc-200/50 border-zinc-200/50">
      <div className="h-3 w-24 rounded-full bg-zinc-200/50" />
      <div className="h-8 w-32 rounded-full bg-zinc-200/50" />
      <div className="h-4 w-2/3 rounded-full bg-zinc-200/50" />
      <div className="h-10 w-28 rounded-2xl bg-zinc-200/50" />
    </div>
  )
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="card animate-pulse flex items-center gap-4 bg-zinc-200/50 border-zinc-200/50">
          <div className="h-11 w-11 rounded-2xl bg-zinc-200/50" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded-full bg-zinc-200/50" />
            <div className="h-3 w-5/6 rounded-full bg-zinc-200/50" />
          </div>
        </div>
      ))}
    </div>
  )
}

