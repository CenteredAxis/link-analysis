export default function CanvasOverlay({
  searchQuery, handleSearch,
  runLayout, cyRef, clearHighlights, setSelected,
  runCentrality, clearCentrality, centralityType,
  openAIExtraction,
}) {
  return (
    <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64 rounded bg-gray-800/90 px-3 py-1.5 pl-8 text-xs text-gray-100 placeholder-gray-500 outline-none backdrop-blur focus:ring-1 focus:ring-amber-500"
        />
        <svg
          className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300"
          >
            &times;
          </button>
        )}
      </div>

      {/* Layout & view buttons */}
      <div className="flex gap-2">
        <button
          onClick={runLayout}
          className="rounded bg-gray-800/90 px-3 py-1.5 text-xs text-gray-300 backdrop-blur transition-colors hover:bg-gray-700 hover:text-white"
        >
          Re-Layout
        </button>
        <button
          onClick={() => cyRef.current?.fit(undefined, 50)}
          className="rounded bg-gray-800/90 px-3 py-1.5 text-xs text-gray-300 backdrop-blur transition-colors hover:bg-gray-700 hover:text-white"
        >
          Fit View
        </button>
        <button
          onClick={() => {
            clearHighlights(cyRef.current)
            setSelected(null)
          }}
          className="rounded bg-gray-800/90 px-3 py-1.5 text-xs text-gray-300 backdrop-blur transition-colors hover:bg-gray-700 hover:text-white"
        >
          Clear Selection
        </button>
      </div>

      {/* AI Extraction button */}
      <div className="flex gap-2">
        <button
          onClick={openAIExtraction}
          className="rounded bg-purple-700/90 px-3 py-1.5 text-xs text-purple-200 backdrop-blur transition-colors hover:bg-purple-600 hover:text-white"
        >
          AI Extract
        </button>
      </div>

      {/* Centrality buttons */}
      <div className="flex gap-1">
        {['degree', 'betweenness', 'closeness'].map((type) => (
          <button
            key={type}
            onClick={() => runCentrality(type)}
            className={`rounded px-2 py-1 text-xs capitalize backdrop-blur transition-colors ${
              centralityType === type
                ? 'bg-amber-600/80 text-white'
                : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
        {centralityType && (
          <button
            onClick={clearCentrality}
            className="rounded bg-red-800/80 px-2 py-1 text-xs text-red-300 backdrop-blur hover:bg-red-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Centrality active label */}
      {centralityType && (
        <div className="rounded bg-gray-800/90 px-2 py-1 text-xs text-gray-400 backdrop-blur">
          {centralityType} centrality &mdash; larger nodes = higher score
        </div>
      )}
    </div>
  )
}
