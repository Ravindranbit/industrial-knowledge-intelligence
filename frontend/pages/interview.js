import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, FileText, Users, Lightbulb, Search } from 'lucide-react'
import { EmptyState, PromptPills, SectionHeader, StatCard, StatusPill, Timeline } from '../components/enterprise-ui'

export default function Interview() {
  const [equipment, setEquipment] = useState('CRAC-3')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [step, setStep] = useState(1)

  const progress = useMemo(() => {
    if (!questions.length) return 0
    return Math.round(((currentIndex + 1) / questions.length) * 100)
  }, [currentIndex, questions.length])

  async function genQuestions(e) {
    e.preventDefault()
    setLoading(true)
    setQuestions([])
    setCurrentIndex(0)
    setStep(2)
    try {
      const res = await fetch(`/api/proxy-interview?equipment_id=${encodeURIComponent(equipment)}`)
      const data = await res.json()
      setQuestions(data.questions || [])
      setStep(3)
    } catch (err) {
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  async function saveAnswers(e) {
    e.preventDefault()
    setLoading(true)
    setSaved(null)
    try {
      const payload = { equipment_id: equipment, answers: Object.entries(answers).map(([question, answer]) => ({ question, answer })) }
      const res = await fetch('/api/proxy-save-answers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      setSaved(data)
      setStep(4)
    } catch (err) {
      setSaved({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  function next() { setCurrentIndex((index) => Math.min(index + 1, questions.length - 1)) }
  function prev() { setCurrentIndex((index) => Math.max(index - 1, 0)) }

  const currentQuestion = questions[currentIndex]

  const steps = [
    { title: 'Select equipment', description: 'Choose the asset to guide the interview.', badge: step >= 1 ? 'Done' : 'Todo', badgeTone: step >= 1 ? 'green' : 'slate' },
    { title: 'Generate questions', description: 'Pull prompts from the tacit knowledge workflow.', badge: step >= 2 ? 'In progress' : 'Todo', badgeTone: step >= 2 ? 'blue' : 'slate' },
    { title: 'Capture answers', description: 'Record responses and keep the session moving.', badge: step >= 3 ? 'Active' : 'Todo', badgeTone: step >= 3 ? 'amber' : 'slate' },
    { title: 'Save session', description: 'Persist the completed interview for future retrieval.', badge: step >= 4 ? 'Saved' : 'Todo', badgeTone: step >= 4 ? 'green' : 'slate' },
  ]

  return (
    <div className="space-y-6">
      <section className="card grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
        <div>
          <SectionHeader
            eyebrow="Workflow"
            title="Guided multi-step interview"
            description="Capture operational knowledge in a sequence that keeps the interviewer oriented, instead of dropping them into a blank form."
          />
          <div className="mt-5 space-y-3">
            {steps.map((item, index) => (
              <div key={item.title} className={`flex gap-4 rounded-2xl border p-4 ${step === index + 1 ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{index + 1}</div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {item.title}
                    <StatusPill tone={item.badgeTone}>{item.badge}</StatusPill>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <StatCard label="Questions captured" value={questions.length || 0} delta={questions.length ? 'Workflow ready' : 'Awaiting generation'} hint="Use the guided flow to capture tacit knowledge" tone="violet" />
          <StatCard label="Completion progress" value={`${progress}%`} delta={loading ? 'Updating' : 'Tracking answers'} hint="Current question completion" tone="blue" />
          <div className="card">
            <div className="text-sm font-semibold text-slate-900">Interview tips</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Ask for examples, not just yes/no answers.</li>
              <li>• Capture the “why” behind each maintenance action.</li>
              <li>• Save the session before moving to the next site lead.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Search className="h-4 w-4 text-blue-600" />Equipment</div>
            <form onSubmit={genQuestions} className="mt-4 space-y-3">
              <input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="Equipment ID (CRAC-3)" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">Generate questions</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              <PromptPills prompts={[ 'CRAC-3', 'Generator A', 'North stack', 'Cooling loop 2' ]} onPick={setEquipment} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users className="h-4 w-4 text-blue-600" />Session log</div>
            <div className="mt-4">
              <Timeline
                items={[
                  { title: 'Owner selected', description: 'Facility engineer started the guided capture session.', meta: 'Just now', dot: 'bg-blue-500' },
                  { title: 'Question set generated', description: 'A tailored set of prompts is ready for the selected asset.', meta: 'Pending', dot: 'bg-slate-300' },
                  { title: 'Answers saved', description: 'The session will be archived after completion.', meta: 'Pending', dot: 'bg-slate-300' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.length > 0 ? (
            <div className="card space-y-5">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">Question {currentIndex + 1} of {questions.length}</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">Guided prompt capture</div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 md:w-64">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ClipboardList className="h-4 w-4 text-blue-600" />Current question</div>
                    <div className="mt-3 text-xl font-semibold leading-8 text-slate-900">{currentQuestion}</div>
                  </div>
                </div>
                <textarea rows={7} className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" value={answers[currentQuestion] || ''} onChange={(e) => setAnswers({ ...answers, [currentQuestion]: e.target.value })} placeholder="Capture the operator's response here..." />
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={prev} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60" disabled={currentIndex === 0}><ChevronLeft className="h-4 w-4" />Prev</button>
                  <button onClick={next} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60" disabled={currentIndex === questions.length - 1}>Next<ChevronRight className="h-4 w-4" /></button>
                </div>
                <button onClick={saveAnswers} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0">Save answers</button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No questions generated yet"
              description="Select an equipment ID and generate a tailored question set to begin the guided interview workflow."
              primaryAction={<button onClick={genQuestions} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0">Generate questions</button>}
              secondaryAction={<button onClick={() => setEquipment('CRAC-3')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0">Use example asset</button>}
              illustration="pulse"
            />
          )}

          {saved && <div className="card text-sm text-slate-700">{saved.error ? `Error: ${saved.error}` : `Saved (id: ${saved.document_id || saved.documentId || 'n/a'})`}</div>}
        </div>
      </section>
    </div>
  )
}

Interview.pageMeta = { title: 'Guided Interview', description: 'Capture tacit knowledge with a stepwise workflow and progress tracking.', breadcrumbs: ['Workspace', 'Interview'] }
