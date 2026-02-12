import { LOCAL_STORAGE_KEY, META_STORAGE_KEY, NODE_SHAPES, NODE_COLORS, RELATIONSHIP_COLORS } from './constants'
import { migrateGraphData, migrateMetaData } from './migration'
import { convertKumuToNative } from './kumu-import'

// ── Graph Data (Cytoscape elements) ──

export function saveGraph(cy) {
  if (!cy) return
  try {
    const data = cy.json()
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // localStorage quota exceeded — silently fail
  }
}

export function loadGraph() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return migrateGraphData(parsed)
  } catch {
    return null
  }
}

// ── Board-Level Meta (groups, annotations, timeline) ──

export function saveMeta(meta) {
  try {
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta))
  } catch (e) {
    // localStorage quota exceeded — silently fail
  }
}

export function loadMeta() {
  return migrateMetaData()
}

// ── Export Graph to JSON ──

export function exportGraphToJSON(cy) {
  if (!cy) return
  const data = {
    nodes: cy.nodes().map((n) => ({
      data: {
        id: n.data('id'),
        label: n.data('label'),
        nodeType: n.data('nodeType'),
        metadata: n.data('metadata'),
        parent: n.data('parent') || undefined,
      },
      position: n.position(),
    })),
    edges: cy.edges().map((e) => ({
      data: {
        id: e.data('id'),
        source: e.data('source'),
        target: e.data('target'),
        relationship: e.data('relationship'),
        weight: e.data('weight'),
      },
    })),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `link-analysis-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Export Image as PNG ──

export function exportImage(cy) {
  if (!cy) return
  const png = cy.png({ full: true, scale: 2, bg: '#030712' })
  const a = document.createElement('a')
  a.href = png
  a.download = `link-analysis-${new Date().toISOString().slice(0, 10)}.png`
  a.click()
}

// ── Import Graph from JSON file ──

export function importGraphFromJSON(cy, file, syncCallback, runLayoutCallback, clearCentralityCallback, setSearchQuery) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const raw = JSON.parse(ev.target.result)
      if (!cy) return

      // Format auto-detection: Kumu vs native Murder Board
      let graphData
      if (Array.isArray(raw.elements) && Array.isArray(raw.connections)) {
        // Kumu format detected
        graphData = convertKumuToNative(raw)
      } else if (raw.nodes) {
        // Native Murder Board format
        graphData = raw
      } else {
        alert('Unrecognized JSON format. Expected Murder Board or Kumu format.')
        return
      }

      cy.elements().remove()

      // Sort nodes so parents come first
      const sortedNodes = [...(graphData.nodes || [])].sort((a, b) => {
        const aHas = a.data.parent ? 1 : 0
        const bHas = b.data.parent ? 1 : 0
        return aHas - bHas
      })

      sortedNodes.forEach((n) => {
        cy.add({
          group: 'nodes',
          data: {
            ...n.data,
            shape: NODE_SHAPES[n.data.nodeType] || 'ellipse',
            color: NODE_COLORS[n.data.nodeType] || '#6b7280',
          },
          position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
        })
      })

      if (graphData.edges) {
        graphData.edges.forEach((edge) => {
          cy.add({
            group: 'edges',
            data: {
              ...edge.data,
              label: edge.data.label || edge.data.relationship,
              color: RELATIONSHIP_COLORS[edge.data.relationship] || RELATIONSHIP_COLORS.Unknown,
            },
          })
        })
      }

      if (setSearchQuery) setSearchQuery('')
      if (clearCentralityCallback) clearCentralityCallback()
      if (syncCallback) syncCallback()
      if (runLayoutCallback) runLayoutCallback()
    } catch {
      alert('Invalid JSON file.')
    }
  }
  reader.readAsText(file)
}
