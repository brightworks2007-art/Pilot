import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from '../common/Modal.jsx'

const STEPS = [
  'Reading your prompt',
  'Deciding what to do',
  'Talking to the document store',
]

/**
 * Shown while a real /execute call is in flight. Since we don't know how
 * long the backend will actually take (real LLM call + real file I/O),
 * this is an indeterminate animation — a rotating step label plus a
 * continuously-cycling progress bar — rather than a bar tied to a known
 * duration. It closes as soon as the real response comes back.
 */
export default function ProcessingModal({ isOpen }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0)
      return
    }
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length)
    }, 1600)
    return () => clearInterval(timer)
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} title="Executing your request" dismissible={false}>
      <div className="flex flex-col items-center text-center py-4">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary/10 text-primary">
          <Loader2 size={26} className="animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {STEPS[stepIndex]}...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Pilot is actually performing this action, not just planning it.
        </p>

        <div className="mt-5 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-primary animate-indeterminate" />
        </div>
      </div>
    </Modal>
  )
}
