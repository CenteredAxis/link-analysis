import { RELATIONSHIP_COLORS, CONFIDENCE_COLORS } from '../../constants'

export default function EdgeDetails({ selected, startEditEdge, deleteElement }) {
  return (
    <>
      <p className="mb-1 text-sm font-bold text-gray-100">
        {selected.sourceLabel} &rarr; {selected.targetLabel}
      </p>

      {/* Custom label prominently */}
      {selected.customLabel && (
        <p className="mb-1 text-xs text-gray-300">
          <span className="font-semibold text-amber-400">{selected.customLabel}</span>
        </p>
      )}

      {/* Relationship */}
      <p className="mb-1 text-xs text-gray-500">
        Relationship:{' '}
        <span
          className="font-semibold"
          style={{
            color: RELATIONSHIP_COLORS[selected.relationship] || '#6b7280',
          }}
        >
          {selected.relationship}
        </span>
      </p>

      {/* Direction badge */}
      {selected.direction && selected.direction !== 'directed' && (
        <p className="mb-1 text-xs text-gray-500">
          Direction:{' '}
          <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-300">
            {selected.direction}
          </span>
        </p>
      )}

      <p className="mb-1 text-xs text-gray-500">
        Weight: <span className="text-gray-300">{selected.weight}</span>
      </p>

      {/* Confidence badge */}
      {selected.confidence && selected.confidence !== 'Confirmed' && (
        <p className="mb-1 text-xs text-gray-500">
          Confidence:{' '}
          <span
            className="rounded px-1.5 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: (CONFIDENCE_COLORS[selected.confidence] || '#6b7280') + '22',
              color: CONFIDENCE_COLORS[selected.confidence] || '#6b7280',
            }}
          >
            {selected.confidence}
          </span>
        </p>
      )}

      {/* Date range */}
      {(selected.startDate || selected.endDate) && (
        <p className="mb-1 text-xs text-gray-500">
          Period:{' '}
          <span className="text-gray-300">
            {selected.startDate || '?'} &mdash; {selected.endDate || 'present'}
          </span>
        </p>
      )}
      {selected.eventDate && (
        <p className="mb-1 text-xs text-gray-500">
          Event Date: <span className="text-gray-300">{selected.eventDate}</span>
        </p>
      )}

      {/* Description */}
      {selected.description && (
        <p className="mb-2 whitespace-pre-wrap text-xs leading-relaxed text-gray-400">
          {selected.description}
        </p>
      )}

      {/* Evidence reference */}
      {selected.evidenceRef && (
        <p className="mb-1 text-xs text-gray-500">
          Evidence: <span className="text-gray-300">{selected.evidenceRef}</span>
        </p>
      )}

      {/* Location */}
      {selected.location && (
        <p className="mb-1 text-xs text-gray-500">
          &#x1F4CD; <span className="text-gray-300">{selected.location}</span>
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => startEditEdge(selected.id)}
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
