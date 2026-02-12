import { NODE_COLORS, STATUS_COLORS } from '../../constants'

export default function NodeDetails({ selected, nodes, startEditNode, deleteElement, assignToCluster, removeFromCluster }) {
  return (
    <>
      {/* Avatar / Type indicator */}
      <div className="mb-3 flex items-center gap-3">
        {selected.avatarUrl ? (
          <img
            src={selected.avatarUrl}
            alt={selected.label}
            className="h-16 w-16 rounded-full border-2 border-gray-700 object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <span
            className="inline-block h-10 w-10 flex-shrink-0"
            style={{
              backgroundColor: NODE_COLORS[selected.nodeType],
              borderRadius: selected.nodeType === 'Person' ? '50%' : '6px',
            }}
          />
        )}
        <div>
          <span className="text-sm font-bold text-gray-100">{selected.label}</span>
          <p className="text-xs text-gray-500">{selected.nodeType}</p>
        </div>
      </div>

      {/* Status badge */}
      {selected.status && (
        <p className="mb-1 text-xs text-gray-500">
          Status:{' '}
          <span
            className="rounded px-1.5 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: (STATUS_COLORS[selected.status] || '#6b7280') + '22',
              color: STATUS_COLORS[selected.status] || '#6b7280',
            }}
          >
            {selected.status}
          </span>
        </p>
      )}

      {/* Role */}
      {selected.role && (
        <p className="mb-1 text-xs text-gray-500">
          Role: <span className="text-gray-300">{selected.role}</span>
        </p>
      )}

      {/* Location */}
      {selected.location && (
        <p className="mb-1 text-xs text-gray-500">
          &#x1F4CD; <span className="text-gray-300">{selected.location}</span>
        </p>
      )}

      {/* DOB */}
      {selected.dob && (
        <p className="mb-1 text-xs text-gray-500">
          DOB: <span className="text-gray-300">{selected.dob}</span>
        </p>
      )}

      {/* Aliases */}
      {selected.aliases && (
        <div className="mb-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-500">AKA:</span>
          {selected.aliases.split(',').map((a, i) => (
            <span
              key={i}
              className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-300"
            >
              {a.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Event-specific details */}
      {selected.nodeType === 'Event' && (
        <div className="mb-2 rounded border border-purple-900/30 bg-purple-950/20 p-2">
          {selected.eventType && (
            <p className="mb-1 text-xs text-gray-500">
              Event Type:{' '}
              <span className="rounded bg-purple-900/40 px-1.5 py-0.5 text-xs text-purple-300">
                {selected.eventType}
              </span>
            </p>
          )}
          {selected.eventDate && (
            <p className="mb-1 text-xs text-gray-500">
              Date: <span className="text-gray-300">{selected.eventDate}</span>
            </p>
          )}
          {selected.eventLocation && (
            <p className="mb-1 text-xs text-gray-500">
              &#x1F4CD; <span className="text-gray-300">{selected.eventLocation}</span>
            </p>
          )}
          {selected.eventDescription && (
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-400">
              {selected.eventDescription}
            </p>
          )}
        </div>
      )}

      {/* Metadata */}
      {selected.metadata && (
        <p className="mb-3 whitespace-pre-wrap text-xs leading-relaxed text-gray-400">
          {selected.metadata}
        </p>
      )}

      {/* Cluster info */}
      {selected.isChild && (
        <div className="mb-2 text-xs text-gray-500">
          Cluster:{' '}
          <span className="text-emerald-400">{selected.parentLabel}</span>
          <button
            onClick={() => {
              removeFromCluster(selected.id)
            }}
            className="ml-2 text-red-400 hover:text-red-300"
          >
            Remove
          </button>
        </div>
      )}

      {/* Assign to org */}
      {selected.nodeType === 'Person' && !selected.isChild && (
        <div className="mb-2">
          <select
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100 outline-none focus:border-amber-500"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                assignToCluster(selected.id, e.target.value)
              }
            }}
          >
            <option value="">Assign to Organization...</option>
            {nodes
              .filter((n) => n.type === 'Organization' && n.id !== selected.id)
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
          </select>
        </div>
      )}

      {selected.connections && selected.connections.length > 0 && (
        <div className="mt-2 border-t border-gray-800 pt-2">
          <p className="mb-1 text-xs font-semibold text-gray-500">
            Connections ({selected.connections.length}):
          </p>
          {selected.connections.map((c) => (
            <p key={c.id} className="text-xs text-gray-400">
              {c.label}: {c.sourceLabel} &rarr; {c.targetLabel}
            </p>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => startEditNode(selected.id)}
          className="rounded bg-amber-600/20 px-3 py-1 text-xs text-amber-400 transition-colors hover:bg-amber-600/30"
        >
          Edit
        </button>
        <button
          onClick={() => deleteElement(selected.id)}
          className="rounded bg-red-600/20 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-600/30"
        >
          Delete
        </button>
      </div>
    </>
  )
}
