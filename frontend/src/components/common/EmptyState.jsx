/**
 * Consistent "nothing here yet" placeholder, used by History and Recent History
 * before any mock tasks exist / after they're cleared.
 */
export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {Icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{description}</p>
      )}
    </div>
  )
}
