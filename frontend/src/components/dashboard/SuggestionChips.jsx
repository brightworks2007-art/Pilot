/**
 * Row of quick-fill prompt suggestions shown under the prompt textarea.
 */
export default function SuggestionChips({ suggestions, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button key={s} type="button" className="chip" onClick={() => onSelect(s)}>
          {s}
        </button>
      ))}
    </div>
  )
}
