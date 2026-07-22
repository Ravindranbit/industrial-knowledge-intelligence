import { useMemo, useState } from 'react'
import { UploadCloud, FileText, Clock3, CheckCircle2, AlertCircle, Sparkles, FileUp } from 'lucide-react'
import { EmptyState, SectionHeader, StatCard, StatusPill, Timeline } from '../components/enterprise-ui'

export default function Ingest() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [stage, setStage] = useState('idle')

  const progress = useMemo(() => {
    if (stage === 'uploading') return 45
    if (stage === 'processing') return 72
    if (stage === 'complete') return 100
    if (stage === 'error') return 100
    return file ? 18 : 0
  }, [file, stage])

  async function upload(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    setStage('uploading')

    const form = new FormData()
    form.append('title', title || (file ? file.name : 'Untitled'))
    form.append('doc_type', 'manual')
    if (file) form.append('file', file)
    if (text) form.append('text', text)

    try {
      setStage('processing')
      const res = await fetch('/api/proxy-ingest', { method: 'POST', body: form })
      const data = await res.json()
      setStatus(data)
      setStage('complete')
    } catch (err) {
      setStatus({ error: err.message })
      setStage('error')
    } finally {
      setLoading(false)
    }
  }

  function onFilePick(nextFile) {
    setFile(nextFile)
    if (!title && nextFile?.name) setTitle(nextFile.name.replace(/\.[^.]+$/, ''))
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragActive(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) onFilePick(dropped)
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Stats Area - Borderless layout */}
      <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl flex-1">
          <SectionHeader
            eyebrow="Document intake"
            title="Drag-and-drop ingestion experience"
            description="Upload knowledge in a guided flow with visible processing states, not just a plain form submission."
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusPill tone="blue">PDF</StatusPill>
            <StatusPill tone="blue">TXT</StatusPill>
            <StatusPill tone="blue">DOCX</StatusPill>
            <StatusPill tone="green">Indexed automatically</StatusPill>
          </div>
        </div>
        <div className="grid w-full gap-4 sm:grid-cols-2 xl:w-[480px]">
          <StatCard label="Processing time" value="~30s" delta="Typical" hint="Depends on document size" tone="blue" />
          <StatCard label="Pipeline state" value={stage === 'complete' ? 'Ready' : stage === 'processing' ? 'Parsing' : 'Idle'} delta={stage === 'error' ? 'Retry needed' : 'Live'} hint="Document processing state" tone={stage === 'error' ? 'amber' : 'green'} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="card">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`rounded-3xl border-2 border-dashed p-8 text-center transition duration-200 ${dragActive ? 'border-pastel-500 bg-pastel-50/50' : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50'}`}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <UploadCloud className="h-8 w-8 text-pastel-700" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">Drop a document here</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">Or choose a file, paste raw text, and send it through the knowledge pipeline.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-pastel-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-pastel-600/15 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-pastel-500 active:translate-y-0">
                  <FileUp className="h-4 w-4" />
                  Select file
                  <input type="file" className="hidden" onChange={(e) => onFilePick(e.target.files[0])} />
                </label>
                <button type="button" onClick={() => { setFile(null); setText(''); setTitle(''); setStatus(null); setStage('idle') }} className="ui-button-secondary text-xs font-semibold">Reset</button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-zinc-650">Document title</div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CRAC maintenance manual" className="ui-input mt-2 text-xs" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-650">Selected file</div>
                <div className="mt-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-550">{file ? file.name : 'No file selected'}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-zinc-650">Or paste raw text</div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className="ui-input mt-2 text-xs leading-relaxed" placeholder="Paste an SOP, incident note, or manual excerpt..." />
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-1.5 w-full rounded-full bg-zinc-200/60 sm:max-w-md">
                <div className={`h-1.5 rounded-full ${stage === 'error' ? 'bg-rose-500' : 'bg-pastel-600'}`} style={{ width: `${progress}%` }} />
              </div>
              <button onClick={upload} disabled={loading} className="ui-button text-xs whitespace-nowrap" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                {loading ? 'Processing...' : 'Ingest document'}
              </button>
            </div>
          </div>

          {status && (
            <div className="card">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                {stage === 'complete' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
                Processing result
              </div>
              <pre className="mt-4 overflow-auto rounded-2xl bg-zinc-50 border border-zinc-250/50 p-4 text-xs text-zinc-600 leading-relaxed max-h-60">{JSON.stringify(status, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900"><Clock3 className="h-4 w-4 text-pastel-700 animate-pulse" />Processing states</div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-zinc-50/50 border border-zinc-200/60 px-4 py-3 text-xs"><span>Queued</span><StatusPill tone={stage === 'idle' ? 'slate' : 'green'}>{stage === 'idle' ? 'Waiting' : 'Done'}</StatusPill></div>
              <div className="flex items-center justify-between rounded-2xl bg-zinc-50/50 border border-zinc-200/60 px-4 py-3 text-xs"><span>Parsing</span><StatusPill tone={stage === 'processing' ? 'amber' : 'green'}>{stage === 'processing' ? 'In progress' : 'Done'}</StatusPill></div>
              <div className="flex items-center justify-between rounded-2xl bg-zinc-50/50 border border-zinc-200/60 px-4 py-3 text-xs"><span>Embedding</span><StatusPill tone={stage === 'complete' ? 'green' : 'slate'}>{stage === 'complete' ? 'Complete' : 'Pending'}</StatusPill></div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900"><CheckCircle2 className="h-4 w-4 text-pastel-700" />Recommended next steps</div>
            <div className="mt-4 space-y-3 text-xs text-zinc-550 leading-relaxed">
              <div className="rounded-2xl bg-zinc-50/50 border border-zinc-200/60 p-4">Review extracted metadata for accuracy.</div>
              <div className="rounded-2xl bg-zinc-50/50 border border-zinc-200/60 p-4">Ask the copilot to summarize the new content.</div>
              <div className="rounded-2xl bg-zinc-50/50 border border-zinc-200/60 p-4">Use the interview workflow to capture missing tacit knowledge.</div>
            </div>
          </div>

          {!file && !text && !status && (
            <EmptyState
              title="No document selected"
              description="Choose a file or paste content to begin the ingestion workflow. The intake panel will show progress as the document moves through parsing and indexing."
               primaryAction={<label className="rounded-2xl bg-pastel-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-pastel-600/15 hover:bg-pastel-500 cursor-pointer"><input type="file" className="hidden" onChange={(e) => onFilePick(e.target.files[0])} />Select file</label>}
              secondaryAction={<button onClick={() => setText('Sample maintenance note...')} className="ui-button-secondary text-xs font-semibold">Insert sample text</button>}
              illustration="diagram"
            />
          )}
        </div>
      </section>
    </div>
  )
}

Ingest.pageMeta = { title: 'Document Intake', description: 'Drag, drop, and process documents through an ingestion workflow.', breadcrumbs: ['Workspace', 'Upload'] }

