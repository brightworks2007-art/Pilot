import { useEffect, useState } from 'react'
import { FileText, Trash2, UploadCloud, Download } from 'lucide-react'
import usePageHeader from '../hooks/usePageHeader.js'
import Card, { CardHeader } from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import UploadDropzone from '../components/dashboard/UploadDropzone.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { formatRelativeTime } from '../utils/formatters.js'
import { uploadDocument, listDocuments, deleteDocument, getDownloadUrl } from '../services/api.js'

/**
 * Dedicated Upload page. Every file dropped here is actually stored in
 * Pilot's Supabase-backed document store via POST /documents/upload —
 * this is real persistence, not a client-side-only staging list.
 */
export default function Upload() {
  usePageHeader('Upload', 'Add documents for Pilot to act on')

  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    refreshDocuments()
  }, [])

  async function refreshDocuments() {
    try {
      const res = await listDocuments()
      setDocuments(res.documents)
    } catch (err) {
      setError(err.message ?? 'Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFileSelected(file) {
    if (!file) return
    setIsUploading(true)
    setError(null)
    try {
      await uploadDocument(file)
      await refreshDocuments()
    } catch (err) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDocument(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(err.message ?? 'Delete failed')
    }
  }

  function handleDownload(id) {
    // Same-tab navigation, not window.open -- the server's Content-Disposition
    // header makes the browser download the file instead of navigating away
    // from the app, so there's no new tab and no visible page change.
    window.location.href = getDownloadUrl(id)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader
          title="Upload a Document"
          description="PDF, DOCX, TXT, XLSX, CSV, PPTX — up to 50MB"
          icon={UploadCloud}
        />
        <UploadDropzone onFileSelected={handleFileSelected} />
        {isUploading && (
          <p className="mt-3 text-xs text-primary flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Uploading to Pilot's document store...
          </p>
        )}
        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      </Card>

      <Card>
        <CardHeader
          title="Documents"
          description={
            isLoading
              ? 'Loading...'
              : `${documents.length} document${documents.length === 1 ? '' : 's'} stored`
          }
        />
        {!isLoading && documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents uploaded yet."
            description="Files you upload here are stored for real and can be acted on from the Dashboard."
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary/10 text-primary">
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {doc.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {doc.file_type.toUpperCase()} · {formatRelativeTime(doc.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" icon={Download} onClick={() => handleDownload(doc.id)}>
                    Download
                  </Button>
                  <Button variant="ghost" icon={Trash2} onClick={() => handleDelete(doc.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
