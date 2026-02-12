import NodeForm from './NodeForm'
import EdgeForm from './EdgeForm'
import NodeList from './NodeList'
import EdgeList from './EdgeList'
import Legend from './Legend'

export default function Sidebar({
  activeTab, setActiveTab,
  nodeForm, setNodeForm, handleAddNode,
  edgeForm, setEdgeForm, handleAddEdge,
  nodes, edges,
  cyRef, clearHighlights,
  exportGraph, importGraph, exportImage,
}) {
  return (
    <div className="flex w-80 flex-shrink-0 flex-col border-r border-gray-800 bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3">
        <h1 className="text-lg font-bold tracking-wider text-amber-400">LINK ANALYSIS</h1>
        <p className="mt-0.5 text-xs text-gray-500">Network Investigation Board</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 py-2 text-xs font-semibold tracking-wide transition-colors ${
            activeTab === 'nodes'
              ? 'border-b-2 border-amber-400 text-amber-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          NODES
        </button>
        <button
          onClick={() => setActiveTab('edges')}
          className={`flex-1 py-2 text-xs font-semibold tracking-wide transition-colors ${
            activeTab === 'edges'
              ? 'border-b-2 border-amber-400 text-amber-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          EDGES
        </button>
      </div>

      {/* Forms + Lists */}
      <div className="sidebar-scroll flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'nodes' ? (
          <>
            <NodeForm
              nodeForm={nodeForm}
              setNodeForm={setNodeForm}
              handleAddNode={handleAddNode}
            />
            <NodeList
              nodes={nodes}
              cyRef={cyRef}
              clearHighlights={clearHighlights}
            />
          </>
        ) : (
          <>
            <EdgeForm
              edgeForm={edgeForm}
              setEdgeForm={setEdgeForm}
              handleAddEdge={handleAddEdge}
              nodes={nodes}
            />
            <EdgeList
              edges={edges}
              cyRef={cyRef}
              clearHighlights={clearHighlights}
            />
            <Legend />
          </>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex gap-2 border-t border-gray-800 px-4 py-3">
        <button
          onClick={exportGraph}
          className="flex-1 rounded border border-gray-700 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-200"
        >
          JSON
        </button>
        <label className="flex flex-1 cursor-pointer items-center justify-center rounded border border-gray-700 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-200">
          Import
          <input type="file" accept=".json" onChange={importGraph} className="hidden" />
        </label>
        <button
          onClick={exportImage}
          className="flex-1 rounded border border-amber-700/50 py-1.5 text-xs text-amber-400/80 transition-colors hover:border-amber-500 hover:text-amber-300"
        >
          PNG
        </button>
      </div>
    </div>
  )
}
