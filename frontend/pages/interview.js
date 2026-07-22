import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
      {/* Top Header & Stats Area - Borderless layout */}
      <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1 max-w-3xl">
          <SectionHeader
            eyebrow="Workflow"
            title="Guided multi-step interview"
            description="Capture operational knowledge in a sequence that keeps the interviewer oriented, instead of dropping them into a blank form."
          />
          <div className="mt-5 space-y-2.5">
            {steps.map((item, index) => {
              const isActive = step === index + 1
              return (
                <div key={item.title} className={`flex gap-4 rounded-2xl border p-4 transition duration-200 ${isActive ? 'border-pastel-500/20 bg-pastel-50/50' : 'border-zinc-200 bg-white shadow-sm'}`}>
                  <div className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? 'bg-pastel-600 text-white shadow-sm' : 'bg-zinc-50 border border-zinc-200 text-zinc-500'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                      {item.title}
                      <StatusPill tone={item.badgeTone}>{item.badge}</StatusPill>
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-550 leading-relaxed">{item.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-3 xl:w-[680px]">
          <StatCard label="Questions captured" value={questions.length || 0} delta={questions.length ? 'Workflow ready' : 'Awaiting generation'} hint="Use guided flow to capture tacit knowledge" tone="violet" />
          <StatCard label="Completion progress" value={`${progress}%`} delta={loading ? 'Updating' : 'Tracking answers'} hint="Current question completion" tone="blue" />
          <div className="card flex flex-col justify-between py-4 px-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Interview tips</div>
              <ul className="mt-3.5 space-y-2 text-xs text-zinc-555 leading-relaxed">
                <li>• Ask for examples, not yes/no.</li>
                <li>• Capture the “why” behind actions.</li>
                <li>• Save before moving to next lead.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Main Panel Grid */}
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <Search className="h-4 w-4 text-pastel-700 animate-pulse" />
              Equipment ID
            </div>
            <form onSubmit={genQuestions} className="mt-4 space-y-3">
              <input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="Equipment ID (CRAC-3)" className="ui-input text-xs" />
              <button type="submit" className="ui-button text-xs w-full">Generate questions</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              <PromptPills prompts={[ 'CRAC-3', 'Generator A', 'North stack', 'Cooling loop 2' ]} onPick={setEquipment} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <Users className="h-4 w-4 text-pastel-700" />
              Session log
            </div>
            <div className="mt-4">
              <Timeline
                items={[
                  { title: 'Owner selected', description: 'Facility engineer started the guided capture session.', meta: 'Just now', dot: 'bg-pastel-600' },
                  { title: 'Question set generated', description: 'A tailored set of prompts is ready for the selected asset.', meta: 'Pending', dot: 'bg-zinc-300' },
                  { title: 'Answers saved', description: 'The session will be archived after completion.', meta: 'Pending', dot: 'bg-zinc-300' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.length > 0 ? (
            <div className="card space-y-5">
              <div className="flex flex-col gap-4 border-b border-zinc-200 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-505">Question {currentIndex + 1} of {questions.length}</div>
                  <div className="mt-1 text-base font-semibold text-zinc-900">Guided prompt capture</div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-150 md:w-64">
                  <div className="h-1.5 rounded-full bg-pastel-600" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-3xl border border-zinc-200 bg-white/60 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pastel-700"><ClipboardList className="h-4 w-4" />Current question</div>
                      <div className="mt-3 text-lg font-bold leading-normal text-zinc-900">{currentQuestion}</div>
                    </div>
                  </div>
                  <textarea rows={7} className="ui-input mt-4 text-xs leading-relaxed" value={answers[currentQuestion] || ''} onChange={(e) => setAnswers({ ...answers, [currentQuestion]: e.target.value })} placeholder="Capture the operator's response here..." />
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={prev} className="ui-button-secondary text-xs inline-flex items-center gap-2" disabled={currentIndex === 0}><ChevronLeft className="h-4 w-4" />Prev</button>
                  <button onClick={next} className="ui-button-secondary text-xs inline-flex items-center gap-2" disabled={currentIndex === questions.length - 1}>Next<ChevronRight className="h-4 w-4" /></button>
                </div>
                <button onClick={saveAnswers} className="ui-button text-xs" style={{ paddingLeft: '20px', paddingRight: '20px' }}>Save answers</button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No questions generated yet"
              description="Select an equipment ID and generate a tailored question set to begin the guided interview workflow."
              primaryAction={<button onClick={genQuestions} className="ui-button text-xs">Generate questions</button>}
              secondaryAction={<button onClick={() => setEquipment('CRAC-3')} className="ui-button-secondary text-xs">Use example asset</button>}
              illustration="pulse"
            />
          )}

          {saved && <div className="card text-xs text-zinc-650 bg-zinc-50 border border-zinc-250/50 p-4 leading-normal">{saved.error ? `Error: ${saved.error}` : `Saved (id: ${saved.document_id || saved.documentId || 'n/a'})`}</div>}
        </div>
      </section>
    </div>
  )
}

Interview.pageMeta = { title: 'Guided Interview', description: 'Capture tacit knowledge with a stepwise workflow and progress tracking.', breadcrumbs: ['Workspace', 'Interview'] }

