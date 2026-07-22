import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Sparkles, BookOpen, ShieldCheck, FileText, Clock3 } from 'lucide-react'
import { EmptyState, PromptPills, SectionHeader, StatusPill, SkeletonCard } from '../components/enterprise-ui'

const suggestedPrompts = [
  'Summarize the latest CRAC-3 incident in plain language.',
  'Show me the evidence behind the current compliance status.',
  'What actions are recommended for the north stack humidity drift?',
  'Extract key maintenance steps from the latest manual upload.',
]

export default function Chat() {
  const [q, setQ] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  async function ask(e) {
    e.preventDefault()
    if (!q.trim()) return
    const userMsg = { role: 'user', text: q }
    setMessages((prev) => [...prev, userMsg])
    setQ('')
    setLoading(true)

    try {
      const res = await fetch('/api/proxy-query', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      const botText = data.answer || JSON.stringify(data)
      const botMsg = { role: 'assistant', text: botText, confidence: data.confidence_tier, sources: data.sources || [] }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Error: ' + err.message, sources: [] }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="space-y-6">
      <section className="card grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
        <div>
          <SectionHeader
            eyebrow="AI Copilot"
            title="Chat with grounded sources"
            description="Ask operational questions in natural language, see cited answers, and keep moving with suggested prompts that mirror ChatGPT-style workflows."
          />
          <div className="mt-5">
            <PromptPills prompts={suggestedPrompts} onPick={setQ} />
          </div>
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><BookOpen className="h-4 w-4 text-blue-600" />Cited answers</div>
            <p className="mt-2 text-sm text-slate-600">Answers include source references so operators can verify facts quickly.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck className="h-4 w-4 text-emerald-600" />Operational context</div>
            <p className="mt-2 text-sm text-slate-600">The conversation stays aligned to incidents, manuals, and compliance evidence.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FileText className="h-4 w-4 text-violet-600" />Markdown support</div>
            <p className="mt-2 text-sm text-slate-600">Responses render lists, tables, and callouts cleanly.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Clock3 className="h-4 w-4 text-amber-600" />Fast next steps</div>
            <p className="mt-2 text-sm text-slate-600">Each answer ends with clear follow-up actions for the operator.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="card flex min-h-[70vh] flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="text-sm font-medium text-slate-500">Conversation</div>
              <div className="text-lg font-semibold text-slate-900">Ask, inspect, and verify</div>
            </div>
            <StatusPill tone={loading ? 'amber' : 'green'}>{loading ? 'Thinking' : 'Ready'}</StatusPill>
          </div>

          <div className="flex-1 space-y-4 overflow-auto py-5">
            {messages.length === 0 && (
              <EmptyState
                title="Start with a question"
                description="Try a suggested prompt or ask the copilot about incidents, equipment behavior, compliance gaps, or recent uploads."
                primaryAction={<button onClick={() => setQ(suggestedPrompts[0])} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Use a suggested prompt</button>}
                secondaryAction={<button onClick={() => setQ('Summarize the latest incident and cite the sources.')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Ask for a summary</button>}
                illustration="pulse"
              />
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm ${message.role === 'user' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                  <div className="text-sm leading-6">
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                    )}
                  </div>

                  {message.role === 'assistant' && (
                    <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone="blue">AI response</StatusPill>
                        {message.confidence && <StatusPill tone="green">Confidence: {message.confidence}</StatusPill>}
                      </div>
                      {message.sources?.length > 0 && (
                        <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                          <div className="font-semibold text-slate-700">Sources</div>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {message.sources.map((source) => <span key={source} className="rounded-full bg-white px-3 py-1 shadow-sm">{source}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-full max-w-[85%]"><SkeletonCard /></div>
              </div>
            )}
          </div>

          <form onSubmit={ask} className="border-t border-slate-200 pt-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100 md:flex-row md:items-end">
              <textarea
                ref={inputRef}
                rows={3}
                className="min-h-[64px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ask about incidents, equipment, compliance, or a recent upload..."
              />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="text-sm font-semibold tracking-tight text-slate-900">Suggested workflows</div>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <button onClick={() => setQ('Compare policy language across manuals and extract deltas.')} className="w-full rounded-2xl bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-blue-100">Compare policy language across manuals and extract deltas.</button>
              <button onClick={() => setQ('Ask for a root-cause summary with citations from incidents.')} className="w-full rounded-2xl bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-blue-100">Ask for a root-cause summary with citations from incidents.</button>
              <button onClick={() => setQ('Turn a response into a checklist for the interview workflow.')} className="w-full rounded-2xl bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-blue-100">Turn a response into a checklist for the interview workflow.</button>
            </div>
          </div>

          <div className="card">
            <div className="text-sm font-semibold tracking-tight text-slate-900">Conversation cues</div>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li>• Source citations appear directly under the answer.</li>
              <li>• Markdown formatting supports numbered steps and tables.</li>
              <li>• Suggested prompts help operators find the right question fast.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

Chat.pageMeta = { title: 'AI Chat', description: 'Ask operational questions, inspect sources, and keep context across every answer.', breadcrumbs: ['Workspace', 'AI Chat'] }
