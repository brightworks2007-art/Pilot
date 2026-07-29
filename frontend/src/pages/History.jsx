import { useEffect, useState } from 'react'
import { Search, FileClock } from 'lucide-react'
import usePageHeader from '../hooks/usePageHeader.js'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { listExecutions } from '../services/api.js'
import { formatRelativeTime, actionStyles } from '../utils/formatters.js'

/**
 * Full, real execution history from GET /executions -- every prompt Pilot
 * has ever acted (or declined to act) on, with a client-side search filter.
 */
export default function History() {
  usePageHeader('History', 'A complete record of every action Pilot has taken')

  const [query, setQuery] = useState('')
  const [executions, setExecutions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    listExecutions(100)
      .then((res) => setExecutions(res.executions))
      .catch((err) => setLoadError(err.message ?? 'Failed to load history'))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = executions.filter((execution) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      (execution.document_title ?? '').toLowerCase().includes(q) ||
      execution.prompt.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by document or prompt..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-400">Loading...</p>
        ) : loadError ? (
          <p className="p-6 text-sm text-danger">{loadError}</p>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileClock}
              title="No matching actions."
              description="Try a different search term, or run a task from the Dashboard."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs text-slate-400">
                  <th className="px-6 py-3 font-medium">Document</th>
                  <th className="px-6 py-3 font-medium hidden md:table-cell">Prompt</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((execution) => {
                  const action = actionStyles(execution.action_taken)
                  return (
                    <tr key={execution.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-200 truncate max-w-[220px]">
                        {execution.document_title || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 hidden md:table-cell truncate max-w-[280px]">
                        {execution.prompt}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge label={action.label} className={action.className} />
                      </td>
                      <td className="px-6 py-3.5 text-right text-slate-400 whitespace-nowrap">
                        {formatRelativeTime(execution.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
