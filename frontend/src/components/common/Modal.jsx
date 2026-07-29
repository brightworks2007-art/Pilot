import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Generic modal shell shared by ProcessingModal and ResultsModal.
 * Handles the overlay, escape-to-close, and consistent chrome so
 * each modal only has to define its own body content.
 */
export default function Modal({ isOpen, onClose, title, children, footer, dismissible = true }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dismissible) onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, dismissible, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={dismissible ? onClose : undefined}
      />
      <div className="relative w-full max-w-lg rounded-card bg-white dark:bg-slate-900 shadow-xl animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          {dismissible && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
