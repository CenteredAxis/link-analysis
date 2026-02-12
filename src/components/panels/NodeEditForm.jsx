import { NODE_TYPES, PERSON_STATUSES, EVENT_TYPES } from '../../constants'

export default function NodeEditForm({ editingNode, setEditingNode, saveEditNode }) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={editingNode.label}
        onChange={(e) =>
          setEditingNode((n) => ({ ...n, label: e.target.value }))
        }
        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
      />
      <select
        value={editingNode.type}
        onChange={(e) =>
          setEditingNode((n) => ({ ...n, type: e.target.value }))
        }
        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-amber-500"
      >
        {NODE_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <textarea
        value={editingNode.metadata}
        onChange={(e) =>
          setEditingNode((n) => ({ ...n, metadata: e.target.value }))
        }
        rows={3}
        placeholder="Metadata / Notes"
        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
      />

      {/* Image URL */}
      <input
        type="url"
        placeholder="Image URL"
        value={editingNode.avatarUrl || ''}
        onChange={(e) =>
          setEditingNode((n) => ({ ...n, avatarUrl: e.target.value }))
        }
        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
      />

      {/* Location */}
      <input
        type="text"
        placeholder="Location"
        value={editingNode.location || ''}
        onChange={(e) =>
          setEditingNode((n) => ({ ...n, location: e.target.value }))
        }
        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
      />

      {/* Person-specific fields */}
      {editingNode.type === 'Person' && (
        <div className="space-y-2 rounded border border-gray-800 p-2">
          <p className="text-xs font-semibold text-gray-500">Person Details</p>
          <input
            type="text"
            placeholder="Role / Title"
            value={editingNode.role || ''}
            onChange={(e) =>
              setEditingNode((n) => ({ ...n, role: e.target.value }))
            }
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
          />
          <input
            type="text"
            placeholder="Aliases (comma-separated)"
            value={editingNode.aliases || ''}
            onChange={(e) =>
              setEditingNode((n) => ({ ...n, aliases: e.target.value }))
            }
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
          />
          <select
            value={editingNode.status || ''}
            onChange={(e) =>
              setEditingNode((n) => ({ ...n, status: e.target.value }))
            }
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
          >
            <option value="">Status...</option>
            {PERSON_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Date of Birth</label>
            <input
              type="date"
              value={editingNode.dob || ''}
              onChange={(e) =>
                setEditingNode((n) => ({ ...n, dob: e.target.value }))
              }
              className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Event-specific fields */}
      {editingNode.type === 'Event' && (
        <div className="space-y-2 rounded border border-gray-800 p-2">
          <p className="text-xs font-semibold text-gray-500">Event Details</p>
          <select
            value={editingNode.eventType || ''}
            onChange={(e) =>
              setEditingNode((n) => ({ ...n, eventType: e.target.value }))
            }
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
          >
            <option value="">Event Type...</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Event Date</label>
            <input
              type="date"
              value={editingNode.eventDate || ''}
              onChange={(e) =>
                setEditingNode((n) => ({ ...n, eventDate: e.target.value }))
              }
              className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
            />
          </div>
          <input
            type="text"
            placeholder="Event Location"
            value={editingNode.eventLocation || ''}
            onChange={(e) =>
              setEditingNode((n) => ({ ...n, eventLocation: e.target.value }))
            }
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
          />
          <textarea
            placeholder="Event Description"
            value={editingNode.eventDescription || ''}
            onChange={(e) =>
              setEditingNode((n) => ({ ...n, eventDescription: e.target.value }))
            }
            rows={2}
            className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={saveEditNode}
          className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500"
        >
          Save
        </button>
        <button
          onClick={() => setEditingNode(null)}
          className="rounded bg-gray-700 px-3 py-1 text-xs text-gray-300 hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
