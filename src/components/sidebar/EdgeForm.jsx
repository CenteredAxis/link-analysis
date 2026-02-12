import { useState } from 'react'
import { RELATIONSHIP_TYPES, EDGE_DIRECTIONS, CONFIDENCE_LEVELS } from '../../constants'

export default function EdgeForm({ edgeForm, setEdgeForm, handleAddEdge, nodes }) {
  const [showEvidence, setShowEvidence] = useState(false)
  const [showTemporal, setShowTemporal] = useState(false)

  return (
    <form onSubmit={handleAddEdge} className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Add Edge
      </h3>
      <select
        value={edgeForm.source}
        onChange={(e) => setEdgeForm((f) => ({ ...f, source: e.target.value }))}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-amber-500"
        required
      >
        <option value="">Source Node...</option>
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.label} ({n.type})
          </option>
        ))}
      </select>
      <select
        value={edgeForm.target}
        onChange={(e) => setEdgeForm((f) => ({ ...f, target: e.target.value }))}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-amber-500"
        required
      >
        <option value="">Target Node...</option>
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.label} ({n.type})
          </option>
        ))}
      </select>
      <select
        value={edgeForm.relationship}
        onChange={(e) => setEdgeForm((f) => ({ ...f, relationship: e.target.value }))}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-amber-500"
      >
        {RELATIONSHIP_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <div>
        <label className="mb-1 block text-xs text-gray-500">
          Weight: {edgeForm.weight}
        </label>
        <input
          type="range"
          min="1"
          max="8"
          value={edgeForm.weight}
          onChange={(e) =>
            setEdgeForm((f) => ({ ...f, weight: Number(e.target.value) }))
          }
          className="w-full accent-amber-500"
        />
      </div>

      {/* Direction */}
      <select
        value={edgeForm.direction || 'directed'}
        onChange={(e) => setEdgeForm((f) => ({ ...f, direction: e.target.value }))}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-amber-500"
      >
        {EDGE_DIRECTIONS.map((d) => (
          <option key={d} value={d}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </option>
        ))}
      </select>

      {/* Custom Label */}
      <input
        type="text"
        placeholder="Action/Verb Label (e.g. 'pays', 'reports to')"
        value={edgeForm.customLabel || ''}
        onChange={(e) => setEdgeForm((f) => ({ ...f, customLabel: e.target.value }))}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
      />

      {/* Evidence & Notes — collapsible */}
      <div className="rounded border border-gray-800">
        <button
          type="button"
          onClick={() => setShowEvidence((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200"
        >
          <span>Evidence &amp; Notes</span>
          <span>{showEvidence ? '▾' : '▸'}</span>
        </button>
        {showEvidence && (
          <div className="space-y-2 px-3 pb-3">
            <textarea
              placeholder="Description"
              value={edgeForm.description || ''}
              onChange={(e) => setEdgeForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Evidence Reference"
              value={edgeForm.evidenceRef || ''}
              onChange={(e) => setEdgeForm((f) => ({ ...f, evidenceRef: e.target.value }))}
              className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
            />
            <select
              value={edgeForm.confidence || 'Confirmed'}
              onChange={(e) => setEdgeForm((f) => ({ ...f, confidence: e.target.value }))}
              className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
            >
              {CONFIDENCE_LEVELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Temporal Data — collapsible */}
      <div className="rounded border border-gray-800">
        <button
          type="button"
          onClick={() => setShowTemporal((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200"
        >
          <span>Temporal Data</span>
          <span>{showTemporal ? '▾' : '▸'}</span>
        </button>
        {showTemporal && (
          <div className="space-y-2 px-3 pb-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Start Date</label>
              <input
                type="date"
                value={edgeForm.startDate || ''}
                onChange={(e) => setEdgeForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">End Date</label>
              <input
                type="date"
                value={edgeForm.endDate || ''}
                onChange={(e) => setEdgeForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Event Date</label>
              <input
                type="date"
                value={edgeForm.eventDate || ''}
                onChange={(e) => setEdgeForm((f) => ({ ...f, eventDate: e.target.value }))}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={
          !edgeForm.source || !edgeForm.target || edgeForm.source === edgeForm.target
        }
        className="w-full rounded bg-emerald-600 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Add Edge
      </button>
    </form>
  )
}
