import { RELATIONSHIP_COLORS } from '../../constants'

export default function EdgeList({ edges, cyRef, clearHighlights }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Edges ({edges.length})
      </h3>
      <div className="space-y-1">
        {edges.map((e) => (
          <div
            key={e.id}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors hover:bg-gray-800"
            onClick={() => {
              const cy = cyRef.current
              if (!cy) return
              const el = cy.getElementById(e.id)
              if (el) {
                clearHighlights(cy)
                el.emit('tap')
              }
            }}
          >
            <span
              className="h-2 w-4 flex-shrink-0 rounded-sm"
              style={{ backgroundColor: RELATIONSHIP_COLORS[e.relationship] }}
            />
            <span className="truncate text-gray-300">
              {e.sourceLabel} &rarr; {e.targetLabel}
            </span>
            <span className="ml-auto whitespace-nowrap text-gray-600">
              {e.customLabel || e.relationship}
            </span>
          </div>
        ))}
        {edges.length === 0 && (
          <p className="text-xs italic text-gray-600">No edges yet. Add one above.</p>
        )}
      </div>
    </div>
  )
}
