import { useCallback, useState } from 'react'
import { executeTask } from '../services/api.js'

/**
 * Drives the Dashboard's Execute flow against the real /execute endpoint:
 * idle -> processing -> completed/failed, exposing whatever the backend
 * actually decided and did (not simulated content).
 */
export default function useTaskRunner() {
  const [status, setStatus] = useState('idle') // idle | processing | completed | failed
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const runTask = useCallback(async ({ prompt, documentId, fileName, fileType }) => {
    setStatus('processing')
    setError(null)
    setResult(null)

    try {
      const response = await executeTask({ prompt, documentId, fileName, fileType })
      setResult(response)
      setStatus('completed')
    } catch (err) {
      setError(err?.message ?? 'Something went wrong while executing this task.')
      setStatus('failed')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, runTask, reset }
}
