import { useState } from 'react'
import { NODE_TYPES, PERSON_STATUSES, EVENT_TYPES } from '../../constants'
import { uploadImage } from '../../api/uploadService'

export default function NodeForm({ nodeForm, setNodeForm, handleAddNode }) {
  const [showPerson, setShowPerson] = useState(false)
  const [showEvent, setShowEvent] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setNodeForm((f) => ({ ...f, avatarUrl: url }))
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <form onSubmit={handleAddNode} className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Add Node
      </h3>
      <input
        type="text"
        placeholder="Name"
        value={nodeForm.label}
        onChange={(e) => setNodeForm((f) => ({ ...f, label: e.target.value }))}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
        required
      />
      <select
        value={nodeForm.type}
        onChange={(e) => setNodeForm((f) => ({ ...f, type: e.target.value }))}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-amber-500"
      >
        {NODE_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Metadata / Notes"
        value={nodeForm.metadata}
        onChange={(e) => setNodeForm((f) => ({ ...f, metadata: e.target.value }))}
        rows={2}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
      />

      {/* Image: URL or File Upload */}
      <div className="space-y-1.5">
        <label className="block text-xs text-gray-500">Image</label>

        {nodeForm.avatarUrl && (
          <div className="flex items-center gap-2">
            <img
              src={nodeForm.avatarUrl}
              alt="preview"
              className="h-10 w-10 rounded border border-gray-700 object-cover"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <button
              type="button"
              onClick={() => setNodeForm((f) => ({ ...f, avatarUrl: '' }))}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        )}

        <input
          type="url"
          placeholder="Image URL"
          value={nodeForm.avatarUrl || ''}
          onChange={(e) => setNodeForm((f) => ({ ...f, avatarUrl: e.target.value }))}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
        />

        <div className="flex items-center gap-2">
          <hr className="flex-1 border-gray-700" />
          <span className="text-[10px] text-gray-600">or</span>
          <hr className="flex-1 border-gray-700" />
        </div>

        <label className="flex cursor-pointer items-center justify-center rounded border border-dashed border-gray-600 py-2 text-xs text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300">
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Location — all types */}
      <input
        type="text"
        placeholder="Location"
        value={nodeForm.location || ''}
        onChange={(e) => setNodeForm((f) => ({ ...f, location: e.target.value }))}
        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
      />

      {/* Person Details — collapsible */}
      {nodeForm.type === 'Person' && (
        <div className="rounded border border-gray-800">
          <button
            type="button"
            onClick={() => setShowPerson((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200"
          >
            <span>Person Details</span>
            <span>{showPerson ? '▾' : '▸'}</span>
          </button>
          {showPerson && (
            <div className="space-y-2 px-3 pb-3">
              <input
                type="text"
                placeholder="Role / Title"
                value={nodeForm.role || ''}
                onChange={(e) => setNodeForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Aliases (comma-separated)"
                value={nodeForm.aliases || ''}
                onChange={(e) => setNodeForm((f) => ({ ...f, aliases: e.target.value }))}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
              />
              <select
                value={nodeForm.status || ''}
                onChange={(e) => setNodeForm((f) => ({ ...f, status: e.target.value }))}
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
                  value={nodeForm.dob || ''}
                  onChange={(e) => setNodeForm((f) => ({ ...f, dob: e.target.value }))}
                  className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Details — collapsible */}
      {nodeForm.type === 'Event' && (
        <div className="rounded border border-gray-800">
          <button
            type="button"
            onClick={() => setShowEvent((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200"
          >
            <span>Event Details</span>
            <span>{showEvent ? '▾' : '▸'}</span>
          </button>
          {showEvent && (
            <div className="space-y-2 px-3 pb-3">
              <select
                value={nodeForm.eventType || ''}
                onChange={(e) => setNodeForm((f) => ({ ...f, eventType: e.target.value }))}
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
                  value={nodeForm.eventDate || ''}
                  onChange={(e) => setNodeForm((f) => ({ ...f, eventDate: e.target.value }))}
                  className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-amber-500"
                />
              </div>
              <input
                type="text"
                placeholder="Event Location"
                value={nodeForm.eventLocation || ''}
                onChange={(e) => setNodeForm((f) => ({ ...f, eventLocation: e.target.value }))}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
              />
              <textarea
                placeholder="Event Description"
                value={nodeForm.eventDescription || ''}
                onChange={(e) => setNodeForm((f) => ({ ...f, eventDescription: e.target.value }))}
                rows={2}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded bg-blue-600 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-blue-500"
      >
        + Add Node
      </button>
    </form>
  )
}
