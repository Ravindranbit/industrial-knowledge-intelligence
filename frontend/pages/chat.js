import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, BookOpen, ShieldCheck, FileText, Clock3 } from 'lucide-react'
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
      {/* Top Header & Intro Area - Borderless layout */}
      <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1 max-w-3xl">
          <SectionHeader
            eyebrow="AI Copilot"
            title="Chat with grounded sources"
            description="Ask operational questions in natural language, see cited answers, and keep moving with suggested prompts that mirror ChatGPT-style workflows."
          />
          <div className="mt-5">
            <PromptPills prompts={suggestedPrompts} onPick={setQ} />
          </div>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-2 xl:w-[540px]">
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900"><BookOpen className="h-4 w-4 text-pastel-700" />Cited answers</div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-550">Answers include source references so operators can verify facts quickly.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900"><ShieldCheck className="h-4 w-4 text-pastel-700" />Operational context</div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-555">The conversation stays aligned to incidents, manuals, and compliance evidence.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900"><FileText className="h-4 w-4 text-pastel-700" />Markdown support</div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-550">Responses render lists, tables, and callouts cleanly.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900"><Clock3 className="h-4 w-4 text-pastel-700" />Fast next steps</div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-555">Each answer ends with clear follow-up actions for the operator.</p>
          </div>
        </div>
      </section>

      {/* Main Chat Interface */}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="card flex min-h-[70vh] flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <div className="text-xs font-semibold text-zinc-500">Conversation</div>
              <div className="text-base font-semibold text-zinc-900">Ask, inspect, and verify</div>
            </div>
            <StatusPill tone={loading ? 'amber' : 'green'}>{loading ? 'Thinking' : 'Ready'}</StatusPill>
          </div>

          <div className="flex-1 space-y-4 overflow-auto py-5">
            {messages.length === 0 && (
              <EmptyState
                title="Start with a question"
                description="Try a suggested prompt or ask the copilot about incidents, equipment behavior, compliance gaps, or recent uploads."
                primaryAction={<button onClick={() => setQ(suggestedPrompts[0])} className="ui-button text-xs font-semibold">Use suggested prompt</button>}
                secondaryAction={<button onClick={() => setQ('Summarize the latest incident and cite the sources.')} className="ui-button-secondary text-xs font-semibold">Ask for summary</button>}
                illustration="pulse"
              />
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-md ${message.role === 'user' ? 'bg-pastel-600 text-white' : 'border border-zinc-200 bg-zinc-50/50 text-zinc-800'}`}>
                  <div className="text-xs leading-relaxed">
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                    )}
                  </div>

                  {message.role === 'assistant' && (
                    <div className="mt-3.5 space-y-3 border-t border-zinc-200 pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone="blue">AI response</StatusPill>
                        {message.confidence && <StatusPill tone="green">Confidence: {message.confidence}</StatusPill>}
                      </div>
                      {message.sources?.length > 0 && (
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
                          <div className="font-semibold text-zinc-700">Sources</div>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {message.sources.map((source) => <span key={source} className="rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm text-[10px] text-zinc-650">{source}</span>)}
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
                <div className="max-w-[85%] rounded-3xl px-5 py-3.5 border border-zinc-200 bg-zinc-50/50 text-zinc-550 shadow-sm flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={ask} className="border-t border-zinc-200 pt-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-zinc-50/50 p-3 shadow-sm focus-within:border-pastel-500/50 focus-within:ring-4 focus-within:ring-pastel-500/10 md:flex-row md:items-end">
              <textarea
                ref={inputRef}
                rows={3}
                className="min-h-[64px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-xs outline-none placeholder:text-zinc-400 text-zinc-800 leading-relaxed"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ask about incidents, equipment, compliance, or a recent upload..."
              />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastel-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-pastel-600/15 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-pastel-500 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap" disabled={loading}>
                <Send className="h-3.5 w-3.5" />
                Send
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Suggested workflows</div>
            <div className="mt-4 space-y-2.5">
              <button onClick={() => setQ('Compare policy language across manuals and extract deltas.')} className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-left text-xs leading-relaxed text-zinc-700 transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-50">Compare policy language across manuals and extract deltas.</button>
              <button onClick={() => setQ('Ask for a root-cause summary with citations from incidents.')} className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-left text-xs leading-relaxed text-zinc-700 transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-50">Ask for a root-cause summary with citations from incidents.</button>
              <button onClick={() => setQ('Turn a response into a checklist for the interview workflow.')} className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-left text-xs leading-relaxed text-zinc-700 transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-50">Turn a response into a checklist for the interview workflow.</button>
            </div>
          </div>

          <div className="card">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Conversation cues</div>
            <ul className="mt-4 space-y-3.5 text-xs text-zinc-550 leading-relaxed">
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

