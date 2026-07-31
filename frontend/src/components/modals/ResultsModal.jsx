import { useState } from 'react'
import { Download, Copy, Check, FileText, HelpCircle } from 'lucide-react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import Badge from '../common/Badge.jsx'
import { actionStyles } from '../../utils/formatters.js'
import { getDownloadUrl, saveBlobAsFile } from '../../services/api.js'

/**
 * Shown once a real /execute call resolves. `result` is the backend's
 * ExecuteResponse: { intent, action_taken, document, message }.
 *
 * When `result.document` exists (create/update/read), Download fetches the
 * REAL file bytes from the backend — this is the "round-trip file
 * integrity" check, not a text summary standing in for it. For "delete"
 * or "unknown", there's no file left to download, so Download falls back
 * to saving the confirmation message as text.
 */
export default function ResultsModal({ isOpen, onClose, result }) {
  const [copied, setCopied] = useState(false)

  if (!result) return null

  const action = actionStyles(result.action_taken)
  const isUnknown = result.action_taken === 'unknown'
  const hasRealFile = Boolean(result.document)

  function handleCopy() {
    navigator.clipboard?.writeText(result.message).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  function handleDownload() {
    if (!hasRealFile) {
      // Delete / unknown — there's no file, so the message is the artifact.
      const blob = new Blob([result.message], { type: 'text/plain' })
      saveBlobAsFile(blob, 'pilot-result.txt')
      return
    }

    // Same-tab navigation, not window.open -- the server's Content-Disposition
    // header makes the browser download the file instead of navigating away
    // from the app, so there's no new tab and no visible page change.
    window.location.href = getDownloadUrl(result.document.id)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Execution Result"
      footer={
        <>
          <Button variant="secondary" icon={copied ? Check : Copy} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleDownload}>
            {hasRealFile ? 'Download File' : 'Download'}
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge label={action.label} className={action.className} />
          {result.document && (
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <FileText size={13} />
              {result.document.title}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 max-h-64 overflow-y-auto">
          <p className="text-sm whitespace-pre-wrap text-slate-600 dark:text-slate-300">
            {result.message}
          </p>
        </div>

        {isUnknown && (
          <p className="flex items-start gap-1.5 text-xs text-amber-600">
            <HelpCircle size={14} className="mt-0.5 shrink-0" />
            Pilot held off on acting because it wasn't confident enough in what you meant.
            Try rephrasing, or be more specific about which document and what change.
          </p>
        )}

        <p className="text-xs text-slate-400">
          Prompt: <span className="italic">"{result.intent?.reasoning}"</span>
        </p>
      </div>
    </Modal>
  )
}
