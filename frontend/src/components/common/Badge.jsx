/**
 * Small pill used for status labels (Completed / Failed / Processing / Queued).
 */
export default function Badge({ label, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}
