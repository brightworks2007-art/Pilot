/**
 * Base card container. Every panel on Dashboard/Upload/History/Settings
 * composes this so spacing, border, and radius stay consistent.
 */
export default function Card({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`card p-6 ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function CardHeader({ title, description, icon: Icon, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-2.5">
        {Icon && (
          <span className="mt-0.5 text-primary">
            <Icon size={18} strokeWidth={2.25} />
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
