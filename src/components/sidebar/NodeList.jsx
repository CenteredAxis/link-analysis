import { NODE_COLORS } from '../../constants'

export default function NodeList({ nodes, cyRef, clearHighlights }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Nodes ({nodes.length})
      </h3>
      <div className="space-y-1">
        {nodes.map((n) => (
          <div
            key={n.id}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-gray-800"
            onClick={() => {
              const cy = cyRef.current
              if (!cy) return
              const el = cy.getElementById(n.id)
              if (el) {
                clearHighlights(cy)
                el.select()
                el.emit('tap')
                cy.animate({ center: { eles: el }, duration: 300 })
              }
            }}
          >
            <span
              className="h-3 w-3 flex-shrink-0"
              style={{
                backgroundColor: NODE_COLORS[n.type],
                borderRadius: n.type === 'Person' ? '50%' : '2px',
              }}
            />
            <span className="truncate text-gray-200">{n.label}</span>
            <span className="ml-auto text-xs text-gray-600">{n.type}</span>
          </div>
        ))}
        {nodes.length === 0 && (
          <p className="text-xs italic text-gray-600">No nodes yet. Add one above.</p>
        )}
      </div>
    </div>
  )
}
