import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import usePageHeader from '../hooks/usePageHeader.js'
import Card, { CardHeader } from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import { aiTaskTemplates } from '../data/mockData.js'

const CATEGORY_STYLES = {
  Create: 'bg-success/10 text-success',
  Read: 'bg-primary/10 text-primary',
  Update: 'bg-amber-100 text-amber-700',
  Delete: 'bg-danger/10 text-danger',
}

/**
 * Library of AI task templates a user can pick as a starting point.
 * Selecting a template is a no-op placeholder for Phase 1 — in Phase 2 this
 * would pre-fill the Dashboard prompt box and jump straight to execution.
 */
export default function AITasks() {
  usePageHeader('AI Tasks', 'Pick a task template to run against your documents')
  const [selectedId, setSelectedId] = useState(null)

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiTaskTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedId(template.id)}
            className={`text-left card p-5 transition-all hover:shadow-card-hover hover:-translate-y-0.5 ${
              selectedId === template.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary/10 text-primary">
                <Sparkles size={16} />
              </span>
              <Badge
                label={template.category}
                className={CATEGORY_STYLES[template.category] ?? 'bg-slate-100 text-slate-500'}
              />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {template.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {template.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              Use this template <ArrowRight size={12} />
            </span>
          </button>
        ))}
      </div>

      {selectedId && (
        <Card>
          <CardHeader
            title="Selected Template"
            description="This is a Phase 1 placeholder — Phase 2 will wire this into a live task run from the Dashboard."
          />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {aiTaskTemplates.find((t) => t.id === selectedId)?.name}
          </p>
        </Card>
      )}
    </div>
  )
}
