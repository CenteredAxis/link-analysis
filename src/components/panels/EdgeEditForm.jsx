import { RELATIONSHIP_TYPES, EDGE_DIRECTIONS, CONFIDENCE_LEVELS } from '../../constants'

export default function EdgeEditForm({ editingEdge, setEditingEdge, saveEditEdge }) {
  const update = (field, value) =>
    setEditingEdge((ed) => ({ ...ed, [field]: value }))

  return (
    <div className="space-y-3">
      {/* Relationship type */}
      <div>
        <label className="mb-1 block text-xs text-gray-500">Relationship</label>
        <select
          value={editingEdge.relationship}
          onChange={(e) => update('relationship', e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
        >
          {RELATIONSHIP_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Direction */}
      <div>
        <label className="mb-1 block text-xs text-gray-500">Direction</label>
        <select
          value={editingEdge.direction || 'directed'}
          onChange={(e) => update('direction', e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
        >
          {EDGE_DIRECTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Custom Label */}
      <div>
        <label className="mb-1 block text-xs text-gray-500">Custom Label (verb/action)</label>
        <input
          type="text"
          placeholder='e.g. "pays", "reports to"'
          value={editingEdge.customLabel || ''}
          onChange={(e) => update('customLabel', e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
        />
      </div>

      {/* Weight slider */}
      <div>
        <label className="mb-1 block text-xs text-gray-500">
          Weight: {editingEdge.weight}
        </label>
        <input
          type="range"
          min="1"
          max="8"
          value={editingEdge.weight}
          onChange={(e) => update('weight', Number(e.target.value))}
          className="w-full accent-amber-500"
        />
      </div>

      {/* Confidence */}
      <div>
        <label className="mb-1 block text-xs text-gray-500">Confidence</label>
        <select
          value={editingEdge.confidence || 'Confirmed'}
          onChange={(e) => update('confidence', e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
        >
          {CONFIDENCE_LEVELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-xs text-gray-500">Description</label>
        <textarea
          rows={2}
          placeholder="Describe this connection..."
          value={editingEdge.description || ''}
          onChange={(e) => update('description', e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
        />
      </div>

      {/* Evidence Reference */}
      <div>
        <label className="mb-1 block text-xs text-gray-500">Evidence Reference</label>
        <input
          type="text"
          placeholder="Source / case file ref"
          value={editingEdge.evidenceRef || ''}
          onChange={(e) => update('evidenceRef', e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
        />
      </div>

      {/* Location */}
      <div>
        <label className="mb-1 block text-xs text-gray-500">Location</label>
        <input
          type="text"
          placeholder="Where did this interaction occur?"
          value={editingEdge.location || ''}
          onChange={(e) => update('location', e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
        />
      </div>

      {/* Temporal Data */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400">Dates</label>
        <div>
          <label className="mb-0.5 block text-xs text-gray-600">Start Date</label>
          <input
            type="date"
            value={editingEdge.startDate || ''}
            onChange={(e) => update('startDate', e.target.value)}
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs text-gray-600">End Date</label>
          <input
            type="date"
            value={editingEdge.endDate || ''}
            onChange={(e) => update('endDate', e.target.value)}
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs text-gray-600">Event Date</label>
          <input
            type="date"
            value={editingEdge.eventDate || ''}
            onChange={(e) => update('eventDate', e.target.value)}
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={saveEditEdge}
          className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500"
        >
          Save
        </button>
        <button
          onClick={() => setEditingEdge(null)}
          className="rounded bg-gray-700 px-3 py-1 text-xs text-gray-300 hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
