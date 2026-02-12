import NodeDetails from './NodeDetails'
import NodeEditForm from './NodeEditForm'
import EdgeDetails from './EdgeDetails'
import EdgeEditForm from './EdgeEditForm'

export default function DetailsPanel({
  selected,
  editingNode, setEditingNode,
  editingEdge, setEditingEdge,
  nodes,
  startEditNode, saveEditNode,
  startEditEdge, saveEditEdge,
  deleteElement,
  assignToCluster, removeFromCluster,
  clearHighlights, setSelected, cyRef,
}) {
  if (!selected) return null

  return (
    <div className="absolute bottom-4 right-4 z-10 w-80 rounded-lg border border-gray-800 bg-gray-900/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          {selected.type === 'node' ? 'Node Details' : 'Edge Details'}
        </h3>
        <button
          onClick={() => {
            clearHighlights(cyRef.current)
            setSelected(null)
            setEditingNode(null)
            setEditingEdge(null)
          }}
          className="text-gray-500 hover:text-gray-300"
        >
          &times;
        </button>
      </div>
      <div className="px-4 py-3">
        {/* Node view */}
        {selected.type === 'node' && !editingNode && (
          <NodeDetails
            selected={selected}
            nodes={nodes}
            startEditNode={startEditNode}
            deleteElement={deleteElement}
            assignToCluster={assignToCluster}
            removeFromCluster={removeFromCluster}
          />
        )}

        {/* Node edit view */}
        {selected.type === 'node' && editingNode && (
          <NodeEditForm
            editingNode={editingNode}
            setEditingNode={setEditingNode}
            saveEditNode={saveEditNode}
          />
        )}

        {/* Edge view */}
        {selected.type === 'edge' && !editingEdge && (
          <EdgeDetails
            selected={selected}
            startEditEdge={startEditEdge}
            deleteElement={deleteElement}
          />
        )}

        {/* Edge edit view */}
        {selected.type === 'edge' && editingEdge && (
          <EdgeEditForm
            editingEdge={editingEdge}
            setEditingEdge={setEditingEdge}
            saveEditEdge={saveEditEdge}
          />
        )}
      </div>
    </div>
  )
}
