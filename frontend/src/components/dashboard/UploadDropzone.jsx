import { useCallback, useRef, useState } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import { acceptedFileTypes } from '../../data/mockData.js'
import { formatFileSize } from '../../utils/formatters.js'

/**
 * Drag-and-drop + click-to-browse upload zone.
 * Purely client-side for Phase 1 — selecting a file just stores it in state
 * and reports it to the parent via `onFileSelected`; nothing is sent anywhere.
 */
export default function UploadDropzone({ onFileSelected }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0]
      if (!file) return
      setSelectedFile(file)
      onFileSelected?.(file)
    },
    [onFileSelected],
  )

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function clearFile() {
    setSelectedFile(null)
    onFileSelected?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary-50 dark:bg-primary/10'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {!selectedFile ? (
          <>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <UploadCloud size={20} strokeWidth={2} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Drag &amp; drop or{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-semibold text-primary hover:underline"
              >
                Browse Files
              </button>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {acceptedFileTypes.join(', ')} — up to 50MB
            </p>
          </>
        ) : (
          <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary/10 text-primary">
              <FileText size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={clearFile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
