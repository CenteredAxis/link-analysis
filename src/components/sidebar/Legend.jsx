import { RELATIONSHIP_TYPES, RELATIONSHIP_COLORS } from '../../constants'

export default function Legend() {
  return (
    <div className="mt-6 rounded border border-gray-800 p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Color Legend
      </h4>
      <div className="space-y-1">
        {RELATIONSHIP_TYPES.map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-4 rounded-sm"
              style={{ backgroundColor: RELATIONSHIP_COLORS[t] }}
            />
            <span className="text-gray-400">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
