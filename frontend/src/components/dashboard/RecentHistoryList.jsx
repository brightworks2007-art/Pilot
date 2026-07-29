import { Clock, FileClock } from 'lucide-react'
import Badge from '../common/Badge.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { formatRelativeTime, actionStyles } from '../../utils/formatters.js'

/**
 * Compact recent-activity list on the Dashboard, backed by real rows from
 * GET /executions (see services/api.js listExecutions).
 */
export default function RecentHistoryList({ executions }) {
  if (!executions || executions.length === 0) {
    return (
      <EmptyState
        icon={FileClock}
        title="No tasks yet."
        description="Upload a document and run a task to see it appear here."
      />
    )
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {executions.slice(0, 5).map((execution) => {
        const action = actionStyles(execution.action_taken)
        return (
          <li key={execution.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {execution.document_title || 'No document'}
              </p>
              <p className="truncate text-xs text-slate-400">{execution.prompt}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} />
                {formatRelativeTime(execution.created_at)}
              </span>
              <Badge label={action.label} className={action.className} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
