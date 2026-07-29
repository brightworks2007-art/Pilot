export function formatRelativeTime(isoString) {
  const date = new Date(isoString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.round(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export function actionStyles(action) {
  switch (action) {
    case 'create':
      return { label: 'Created', className: 'bg-success/10 text-success' }
    case 'read':
      return { label: 'Read', className: 'bg-primary/10 text-primary' }
    case 'update':
      return { label: 'Updated', className: 'bg-amber-100 text-amber-700' }
    case 'delete':
      return { label: 'Deleted', className: 'bg-danger/10 text-danger' }
    default:
      return { label: 'Unclear', className: 'bg-slate-100 text-slate-500' }
  }
}
