import { useEffect, useState } from 'react'
import { Sparkles, PlayCircle, History as HistoryIcon } from 'lucide-react'
import usePageHeader from '../hooks/usePageHeader.js'
import useTaskRunner from '../hooks/useTaskRunner.js'
import Card, { CardHeader } from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import UploadDropzone from '../components/dashboard/UploadDropzone.jsx'
import PromptInput from '../components/dashboard/PromptInput.jsx'
import StatsCards from '../components/dashboard/StatsCards.jsx'
import RecentHistoryList from '../components/dashboard/RecentHistoryList.jsx'
import ProcessingModal from '../components/modals/ProcessingModal.jsx'
import ResultsModal from '../components/modals/ResultsModal.jsx'
import { uploadDocument, listExecutions } from '../services/api.js'

export default function Dashboard() {
  usePageHeader('Dashboard', 'Your AI document processing overview')

  const [uploadedDoc, setUploadedDoc] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [recentExecutions, setRecentExecutions] = useState([])
  const { status, result, error, runTask, reset } = useTaskRunner()

  // Prompts that don't reference an uploaded document (e.g. "create a new
  // memo titled...") are still valid — only require the prompt itself.
  const canExecute = prompt.trim().length > 0 && status !== 'processing'

  useEffect(() => {
    loadRecentExecutions()
  }, [])

  async function loadRecentExecutions() {
    try {
      const { executions } = await listExecutions(5)
      setRecentExecutions(executions)
    } catch {
      // History failing to load shouldn't block the rest of the dashboard.
      setRecentExecutions([])
    }
  }

  async function handleFileSelected(file) {
    if (!file) {
      setUploadedDoc(null)
      return
    }
    setIsUploading(true)
    setUploadError(null)
    try {
      const doc = await uploadDocument(file)
      setUploadedDoc(doc)
    } catch (err) {
      setUploadError(err.message ?? 'Upload failed')
      setUploadedDoc(null)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleExecute() {
    if (!canExecute) return
    await runTask({ prompt, documentId: uploadedDoc?.id })
    setShowResults(true)
    loadRecentExecutions()
  }

  function handleCloseResults() {
    setShowResults(false)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Welcome Back <span aria-hidden>👋</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tell Pilot what to do — it actually does it.
          </p>
        </div>
        <Button
          icon={Sparkles}
          onClick={() => document.getElementById('prompt-card')?.scrollIntoView({ behavior: 'smooth' })}
        >
          New Task
        </Button>
      </div>

      <StatsCards />

      <Card>
        <CardHeader
          title="Upload a Document (optional)"
          description="Needed for read/update/delete — not for creating something new"
        />
        <UploadDropzone onFileSelected={handleFileSelected} />
        {isUploading && <p className="mt-3 text-xs text-primary">Uploading...</p>}
        {uploadError && <p className="mt-3 text-xs text-danger">{uploadError}</p>}
      </Card>

      <Card id="prompt-card">
        <CardHeader title="What should Pilot do?" />
        <PromptInput value={prompt} onChange={setPrompt} />
        {status === 'failed' && error && (
          <p className="mt-3 text-xs text-danger">{error}</p>
        )}
        <div className="mt-5 flex justify-end">
          <Button icon={PlayCircle} disabled={!canExecute} onClick={handleExecute}>
            Execute Task
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Recent History" icon={HistoryIcon} />
        <RecentHistoryList executions={recentExecutions} />
      </Card>

      <ProcessingModal isOpen={status === 'processing'} />
      <ResultsModal isOpen={showResults} onClose={handleCloseResults} result={result} />
    </div>
  )
}
