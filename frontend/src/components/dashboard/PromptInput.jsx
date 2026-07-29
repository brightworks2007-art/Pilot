import { promptSuggestions } from '../../data/mockData.js'
import SuggestionChips from './SuggestionChips.jsx'

/**
 * "What should Pilot do?" prompt box + suggestion chips.
 * Controlled component — the parent (Dashboard) owns the prompt text.
 */
export default function PromptInput({ value, onChange }) {
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Summarize this document into bullet points..."
        className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
      />
      <SuggestionChips suggestions={promptSuggestions} onSelect={onChange} />
    </div>
  )
}
