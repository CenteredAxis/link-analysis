import { useRef } from 'react'
import { useCytoscape } from './hooks/useCytoscape'
import { useCytoscapeActions } from './hooks/useCytoscapeActions'
import { useAnalysis } from './hooks/useAnalysis'
import { useAIExtraction } from './hooks/useAIExtraction'
import { exportGraphToJSON, exportImage, importGraphFromJSON } from './storage'
import Sidebar from './components/sidebar/Sidebar'
import GraphCanvas from './components/canvas/GraphCanvas'
import CanvasOverlay from './components/canvas/CanvasOverlay'
import DetailsPanel from './components/panels/DetailsPanel'
import AIExtractionModal from './components/ai/AIExtractionModal'

export default function App() {
  const containerRef = useRef(null)

  // Stable refs for callbacks (used by useCytoscape for context menus & events)
  const syncStateRef = useRef(null)
  const startEditNodeRef = useRef(null)
  const startEditEdgeRef = useRef(null)
  const deleteElementRef = useRef(null)
  const setActiveTabRef = useRef(null)
  const setEdgeFormRef = useRef(null)
  const runLayoutRef = useRef(null)
  const clearHighlightsRef = useRef(null)
  const setSelectedRef = useRef(null)

  // Initialize Cytoscape
  const { cyRef } = useCytoscape(containerRef, {
    syncStateRef,
    startEditNodeRef,
    startEditEdgeRef,
    deleteElementRef,
    setActiveTabRef,
    setEdgeFormRef,
    runLayoutRef,
    clearHighlightsRef,
    setSelectedRef,
  })

  // Analysis hook
  const { runCentrality, clearCentrality, centralityType } = useAnalysis(cyRef)

  // All CRUD actions
  const actions = useCytoscapeActions(cyRef, clearCentrality)

  // AI extraction
  const aiExtraction = useAIExtraction(cyRef)

  // Keep stable refs up to date
  syncStateRef.current = actions.syncState
  startEditNodeRef.current = actions.startEditNode
  startEditEdgeRef.current = actions.startEditEdge
  deleteElementRef.current = actions.deleteElement
  setActiveTabRef.current = actions.setActiveTab
  setEdgeFormRef.current = actions.setEdgeForm
  runLayoutRef.current = actions.runLayout
  clearHighlightsRef.current = actions.clearHighlights
  setSelectedRef.current = actions.setSelected

  // Export/Import handlers
  function handleExportGraph() {
    exportGraphToJSON(cyRef.current)
  }

  function handleExportImage() {
    exportImage(cyRef.current)
  }

  function handleImportGraph(e) {
    const file = e.target.files[0]
    importGraphFromJSON(
      cyRef.current,
      file,
      actions.syncState,
      actions.runLayout,
      clearCentrality,
      actions.setSearchQuery
    )
    e.target.value = ''
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 font-mono">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={actions.activeTab}
        setActiveTab={actions.setActiveTab}
        nodeForm={actions.nodeForm}
        setNodeForm={actions.setNodeForm}
        handleAddNode={actions.handleAddNode}
        edgeForm={actions.edgeForm}
        setEdgeForm={actions.setEdgeForm}
        handleAddEdge={actions.handleAddEdge}
        nodes={actions.nodes}
        edges={actions.edges}
        cyRef={cyRef}
        clearHighlights={actions.clearHighlights}
        exportGraph={handleExportGraph}
        importGraph={handleImportGraph}
        exportImage={handleExportImage}
      />

      {/* Graph Canvas */}
      <div className="relative flex-1">
        <CanvasOverlay
          searchQuery={actions.searchQuery}
          handleSearch={actions.handleSearch}
          runLayout={actions.runLayout}
          cyRef={cyRef}
          clearHighlights={actions.clearHighlights}
          setSelected={actions.setSelected}
          runCentrality={runCentrality}
          clearCentrality={clearCentrality}
          centralityType={centralityType}
          openAIExtraction={aiExtraction.openModal}
        />

        <GraphCanvas ref={containerRef} />

        <DetailsPanel
          selected={actions.selected}
          editingNode={actions.editingNode}
          setEditingNode={actions.setEditingNode}
          editingEdge={actions.editingEdge}
          setEditingEdge={actions.setEditingEdge}
          nodes={actions.nodes}
          startEditNode={actions.startEditNode}
          saveEditNode={actions.saveEditNode}
          startEditEdge={actions.startEditEdge}
          saveEditEdge={actions.saveEditEdge}
          deleteElement={actions.deleteElement}
          assignToCluster={actions.assignToCluster}
          removeFromCluster={actions.removeFromCluster}
          clearHighlights={actions.clearHighlights}
          setSelected={actions.setSelected}
          cyRef={cyRef}
        />
      </div>

      {/* AI Extraction Modal */}
      {aiExtraction.isOpen && (
        <AIExtractionModal
          phase={aiExtraction.phase}
          sourceText={aiExtraction.sourceText}
          setSourceText={aiExtraction.setSourceText}
          proposedNodes={aiExtraction.proposedNodes}
          proposedEdges={aiExtraction.proposedEdges}
          error={aiExtraction.error}
          showSettings={aiExtraction.showSettings}
          setShowSettings={aiExtraction.setShowSettings}
          settings={aiExtraction.settings}
          updateSettings={aiExtraction.updateSettings}
          runExtraction={aiExtraction.runExtraction}
          cancelExtraction={aiExtraction.cancelExtraction}
          closeModal={aiExtraction.closeModal}
          toggleNode={aiExtraction.toggleNode}
          toggleEdge={aiExtraction.toggleEdge}
          acceptAll={aiExtraction.acceptAll}
          rejectAll={aiExtraction.rejectAll}
          commitAccepted={aiExtraction.commitAccepted}
          retryExtraction={aiExtraction.retryExtraction}
          syncState={actions.syncState}
          runLayout={actions.runLayout}
          clearCentrality={clearCentrality}
          existingNodes={actions.nodes}
        />
      )}
    </div>
  )
}
