import { useState, useEffect, useMemo } from 'react'
import AISettingsPanel from './AISettingsPanel'

export default function AIExtractionModal({
  phase, sourceText, setSourceText,
  proposedNodes, proposedEdges, error,
  showSettings, setShowSettings,
  settings, updateSettings,
  runExtraction, cancelExtraction, closeModal,
  toggleNode, toggleEdge,
  acceptAll, rejectAll,
  commitAccepted, retryExtraction,
  // From App.jsx
  syncState, runLayout, clearCentrality, existingNodes,
}) {
  const [elapsed, setElapsed] = useState(0)

  // Elapsed timer during loading
  useEffect(() => {
    if (phase !== 'loading') { setElapsed(0); return }
    const start = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [phase])

  // Duplicate detection: build set of existing labels
  const existingLabelSet = useMemo(() => {
    const s = new Set()
    ;(existingNodes || []).forEach((n) => s.add(n.label?.toLowerCase()))
    return s
  }, [existingNodes])

  // Count accepted items
  const acceptedNodeCount = proposedNodes.filter((n) => n.accepted === true).length
  const acceptedEdgeCount = proposedEdges.filter((e) => e.accepted === true).length
  const totalAccepted = acceptedNodeCount + acceptedEdgeCount

  // Check if edges have rejected endpoint nodes
  const rejectedNodeIds = useMemo(() => {
    const s = new Set()
    proposedNodes.forEach((n) => { if (n.accepted === false) s.add(n._tempId) })
    return s
  }, [proposedNodes])

  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-gray-700 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h2 className="text-sm font-semibold text-amber-400">
            {phase === 'review' ? 'Review Extracted Entities' : 'AI Entity Extraction'}
          </h2>
          <div className="flex items-center gap-2">
            {phase !== 'loading' && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`rounded p-1 text-xs transition-colors ${
                  showSettings ? 'bg-amber-600/30 text-amber-300' : 'text-gray-500 hover:text-gray-300'
                }`}
                title="Settings"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={closeModal}
              className="text-gray-500 transition-colors hover:text-gray-300"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Settings panel (inline toggle) */}
          {showSettings && (
            <AISettingsPanel
              settings={settings}
              updateSettings={updateSettings}
              onClose={() => setShowSettings(false)}
            />
          )}

          {!showSettings && phase === 'input' && (
            <InputPhase
              sourceText={sourceText}
              setSourceText={setSourceText}
              wordCount={wordCount}
              runExtraction={runExtraction}
              settings={settings}
            />
          )}

          {!showSettings && phase === 'loading' && (
            <LoadingPhase
              elapsed={elapsed}
              model={settings.model}
              cancelExtraction={cancelExtraction}
            />
          )}

          {!showSettings && phase === 'review' && (
            <ReviewPhase
              proposedNodes={proposedNodes}
              proposedEdges={proposedEdges}
              toggleNode={toggleNode}
              toggleEdge={toggleEdge}
              existingLabelSet={existingLabelSet}
              rejectedNodeIds={rejectedNodeIds}
            />
          )}

          {!showSettings && phase === 'error' && (
            <ErrorPhase error={error} />
          )}
        </div>

        {/* Footer */}
        {!showSettings && (
          <div className="border-t border-gray-700 px-4 py-3">
            {phase === 'input' && (
              <div className="flex justify-end">
                <button
                  onClick={runExtraction}
                  disabled={!sourceText.trim()}
                  className="rounded bg-purple-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Extract Entities
                </button>
              </div>
            )}

            {phase === 'review' && (
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={acceptAll}
                    className="rounded bg-emerald-700 px-3 py-1.5 text-xs text-emerald-200 transition-colors hover:bg-emerald-600">
                    Accept All
                  </button>
                  <button onClick={rejectAll}
                    className="rounded bg-red-800 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-700">
                    Reject All
                  </button>
                </div>
                <button
                  onClick={() => commitAccepted(syncState, runLayout, clearCentrality)}
                  disabled={totalAccepted === 0}
                  className="rounded bg-purple-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add {totalAccepted} to Board
                </button>
              </div>
            )}

            {phase === 'error' && (
              <div className="flex justify-end">
                <button
                  onClick={retryExtraction}
                  className="rounded bg-gray-700 px-4 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-600"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


// ── Sub-components ──

function InputPhase({ sourceText, setSourceText, wordCount, settings }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        Paste an article, intelligence report, or case notes below. The AI will extract entities and relationships.
      </p>
      <textarea
        rows={15}
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        placeholder="Paste unstructured text here..."
        className="w-full resize-y rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-purple-500"
      />
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{wordCount} words &middot; {sourceText.length.toLocaleString()} chars</span>
        <span>Model: {settings.model}</span>
      </div>
    </div>
  )
}

function LoadingPhase({ elapsed, model, cancelExtraction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Spinner */}
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      <p className="mb-1 text-sm text-gray-300">
        Analyzing text with <span className="text-purple-400">{model}</span>...
      </p>
      <p className="mb-4 text-xs text-gray-500">{elapsed}s elapsed</p>
      <button
        onClick={cancelExtraction}
        className="rounded bg-gray-700 px-4 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-600"
      >
        Cancel
      </button>
    </div>
  )
}

function ReviewPhase({
  proposedNodes, proposedEdges,
  toggleNode, toggleEdge,
  existingLabelSet, rejectedNodeIds,
}) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded bg-gray-800 px-3 py-2 text-xs text-gray-300">
        Found <span className="font-medium text-purple-400">{proposedNodes.length}</span> entities
        {' '}and <span className="font-medium text-purple-400">{proposedEdges.length}</span> relationships
      </div>

      {/* Nodes */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Entities ({proposedNodes.length})
        </h4>
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {proposedNodes.map((node) => {
            const isDuplicate = existingLabelSet.has(node.label.toLowerCase())
            return (
              <div
                key={node._tempId}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                  node.accepted === true
                    ? 'border-l-2 border-emerald-500 bg-emerald-900/20'
                    : node.accepted === false
                    ? 'border-l-2 border-red-500 bg-red-900/10 opacity-50'
                    : 'border-l-2 border-gray-600 bg-gray-800/50'
                }`}
              >
                {/* Type badge */}
                <span
                  className="flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: node.color + '30', color: node.color }}
                >
                  {node.nodeType}
                </span>

                {/* Label */}
                <span className={`flex-1 truncate ${node.accepted === false ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                  {node.label}
                </span>

                {/* Duplicate badge */}
                {isDuplicate && (
                  <span className="flex-shrink-0 rounded bg-yellow-900/40 px-1.5 py-0.5 text-xs text-yellow-400">
                    Exists
                  </span>
                )}

                {/* Metadata preview */}
                {node.metadata && (
                  <span className="hidden max-w-32 flex-shrink-0 truncate text-gray-500 sm:inline">
                    {node.metadata}
                  </span>
                )}

                {/* Accept/Reject toggle */}
                <button
                  onClick={() => toggleNode(node._tempId)}
                  className={`flex-shrink-0 rounded px-2 py-0.5 text-xs transition-colors ${
                    node.accepted === true
                      ? 'bg-emerald-700 text-emerald-200 hover:bg-emerald-600'
                      : node.accepted === false
                      ? 'bg-red-800 text-red-200 hover:bg-red-700'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {node.accepted === true ? 'Accepted' : node.accepted === false ? 'Rejected' : 'Pending'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edges */}
      {proposedEdges.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Relationships ({proposedEdges.length})
          </h4>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {proposedEdges.map((edge) => {
              const endpointRejected =
                rejectedNodeIds.has(edge.sourceTempId) ||
                rejectedNodeIds.has(edge.targetTempId)

              return (
                <div
                  key={edge._tempId}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                    endpointRejected
                      ? 'border-l-2 border-gray-700 bg-gray-800/30 opacity-30'
                      : edge.accepted === true
                      ? 'border-l-2 border-emerald-500 bg-emerald-900/20'
                      : edge.accepted === false
                      ? 'border-l-2 border-red-500 bg-red-900/10 opacity-50'
                      : 'border-l-2 border-gray-600 bg-gray-800/50'
                  }`}
                >
                  {/* Relationship badge */}
                  <span
                    className="flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: edge.color + '30', color: edge.color }}
                  >
                    {edge.relationship}
                  </span>

                  {/* Source -> Target */}
                  <span className={`flex-1 truncate ${
                    edge.accepted === false || endpointRejected ? 'line-through text-gray-500' : 'text-gray-200'
                  }`}>
                    {edge.sourceLabel} &rarr; {edge.targetLabel}
                  </span>

                  {/* Custom label */}
                  {edge.customLabel && (
                    <span className="flex-shrink-0 truncate text-amber-400/70">
                      "{edge.customLabel}"
                    </span>
                  )}

                  {/* Accept/Reject toggle */}
                  <button
                    onClick={() => toggleEdge(edge._tempId)}
                    disabled={endpointRejected}
                    className={`flex-shrink-0 rounded px-2 py-0.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                      edge.accepted === true
                        ? 'bg-emerald-700 text-emerald-200 hover:bg-emerald-600'
                        : edge.accepted === false
                        ? 'bg-red-800 text-red-200 hover:bg-red-700'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {edge.accepted === true ? 'Accepted' : edge.accepted === false ? 'Rejected' : 'Pending'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ErrorPhase({ error }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-3 text-3xl">&#9888;</div>
      <p className="mb-2 text-sm font-medium text-red-400">Extraction Failed</p>
      <p className="max-w-md text-center text-xs text-gray-400">{error}</p>
    </div>
  )
}
