import { useState, useRef, useCallback } from 'react'
import { loadAISettings, saveAISettings } from '../ai/aiSettings'
import { extractEntities } from '../ai/aiService'
import { parseAIResponse } from '../ai/responseParser'
import {
  NODE_SHAPES, NODE_COLORS, RELATIONSHIP_COLORS,
} from '../constants'

/**
 * Hook managing the full AI entity extraction flow:
 * idle -> input -> loading -> review -> commit
 *
 * @param {React.MutableRefObject} cyRef - Cytoscape instance ref
 */
export function useAIExtraction(cyRef) {
  const [isOpen, setIsOpen] = useState(false)
  const [phase, setPhase] = useState('input') // input | loading | review | error
  const [sourceText, setSourceText] = useState('')
  const [proposedNodes, setProposedNodes] = useState([])
  const [proposedEdges, setProposedEdges] = useState([])
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => loadAISettings())
  const abortRef = useRef(null)

  // ── Modal lifecycle ──

  const openModal = useCallback(() => {
    setIsOpen(true)
    setPhase('input')
    setSourceText('')
    setProposedNodes([])
    setProposedEdges([])
    setError('')
    setShowSettings(false)
  }, [])

  const closeModal = useCallback(() => {
    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setIsOpen(false)
    setPhase('input')
    setSourceText('')
    setProposedNodes([])
    setProposedEdges([])
    setError('')
    setShowSettings(false)
  }, [])

  // ── Settings ──

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings)
    saveAISettings(newSettings)
  }, [])

  // ── Run extraction ──

  const runExtraction = useCallback(async () => {
    if (!sourceText.trim()) return

    // Text length check
    if (sourceText.length > 50000) {
      setError('Text exceeds 50,000 characters. Please trim it to avoid overwhelming the model.')
      setPhase('error')
      return
    }

    setPhase('loading')
    setError('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const rawContent = await extractEntities(sourceText, settings, controller.signal)
      const { nodes, edges } = parseAIResponse(rawContent)

      if (nodes.length === 0 && edges.length === 0) {
        setError('No entities or relationships found in the text. Try a longer or more detailed passage.')
        setPhase('error')
        return
      }

      setProposedNodes(nodes)
      setProposedEdges(edges)
      setPhase('review')
    } catch (err) {
      if (err.name === 'AbortError') {
        setPhase('input')
        return
      }
      setError(err.message || 'An unexpected error occurred.')
      setPhase('error')
    } finally {
      abortRef.current = null
    }
  }, [sourceText, settings])

  const cancelExtraction = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  // ── Review actions ──

  const toggleNode = useCallback((tempId) => {
    setProposedNodes((prev) =>
      prev.map((n) =>
        n._tempId === tempId
          ? { ...n, accepted: n.accepted === true ? false : true }
          : n
      )
    )
  }, [])

  const toggleEdge = useCallback((tempId) => {
    setProposedEdges((prev) =>
      prev.map((e) =>
        e._tempId === tempId
          ? { ...e, accepted: e.accepted === true ? false : true }
          : e
      )
    )
  }, [])

  const updateProposedNode = useCallback((tempId, changes) => {
    setProposedNodes((prev) =>
      prev.map((n) => (n._tempId === tempId ? { ...n, ...changes } : n))
    )
  }, [])

  const updateProposedEdge = useCallback((tempId, changes) => {
    setProposedEdges((prev) =>
      prev.map((e) => (e._tempId === tempId ? { ...e, ...changes } : e))
    )
  }, [])

  const acceptAll = useCallback(() => {
    setProposedNodes((prev) => prev.map((n) => ({ ...n, accepted: true })))
    setProposedEdges((prev) => prev.map((e) => ({ ...e, accepted: true })))
  }, [])

  const rejectAll = useCallback(() => {
    setProposedNodes((prev) => prev.map((n) => ({ ...n, accepted: false })))
    setProposedEdges((prev) => prev.map((e) => ({ ...e, accepted: false })))
  }, [])

  // ── Commit accepted items to Cytoscape ──

  const commitAccepted = useCallback(
    (syncState, runLayout, clearCentrality) => {
      const cy = cyRef.current
      if (!cy) return

      // Build map of existing node labels (case-insensitive) -> existing IDs
      const existingLabels = {}
      cy.nodes().forEach((n) => {
        existingLabels[n.data('label').toLowerCase()] = n.data('id')
      })

      // Map from tempId -> real ID (for edge resolution)
      const idMap = {}
      let counter = 0

      // Add accepted nodes (skip duplicates)
      const acceptedNodes = proposedNodes.filter((n) => n.accepted === true)
      acceptedNodes.forEach((node) => {
        const existingId = existingLabels[node.label.toLowerCase()]
        if (existingId) {
          // Entity already exists — reuse its ID, don't create duplicate
          idMap[node._tempId] = existingId
          return
        }

        const realId = `n${Date.now()}${counter++}`
        idMap[node._tempId] = realId

        cy.add({
          group: 'nodes',
          data: {
            id: realId,
            label: node.label,
            nodeType: node.nodeType,
            metadata: node.metadata,
            shape: NODE_SHAPES[node.nodeType],
            color: NODE_COLORS[node.nodeType],
            role: node.role,
            aliases: node.aliases,
            status: node.status,
            avatarUrl: node.avatarUrl || '',
            location: node.location,
            dob: node.dob,
            eventType: node.eventType,
            eventDate: node.eventDate,
            eventLocation: node.eventLocation,
            eventDescription: node.eventDescription,
            tags: '[]',
          },
          position: {
            x: Math.random() * 400 + 100,
            y: Math.random() * 400 + 100,
          },
        })
      })

      // Add accepted edges
      const acceptedEdges = proposedEdges.filter((e) => e.accepted === true)
      acceptedEdges.forEach((edge) => {
        const sourceId = idMap[edge.sourceTempId]
        const targetId = idMap[edge.targetTempId]
        if (!sourceId || !targetId || sourceId === targetId) return

        // Check if this exact edge already exists
        const duplicate = cy.edges().some(
          (existing) =>
            existing.data('source') === sourceId &&
            existing.data('target') === targetId &&
            existing.data('relationship') === edge.relationship
        )
        if (duplicate) return

        const realId = `e${Date.now()}${counter++}`
        const displayLabel = edge.customLabel || edge.relationship

        cy.add({
          group: 'edges',
          data: {
            id: realId,
            source: sourceId,
            target: targetId,
            label: displayLabel,
            relationship: edge.relationship,
            weight: edge.weight,
            color: RELATIONSHIP_COLORS[edge.relationship] || RELATIONSHIP_COLORS.Unknown,
            direction: edge.direction,
            customLabel: edge.customLabel,
            description: edge.description,
            evidenceRef: '',
            confidence: edge.confidence,
            startDate: edge.startDate,
            endDate: edge.endDate,
            eventDate: edge.eventDate,
            evidenceItems: '[]',
            location: edge.location,
          },
        })
      })

      clearCentrality()
      syncState()
      runLayout()
      closeModal()
    },
    [proposedNodes, proposedEdges, cyRef, closeModal]
  )

  return {
    // State
    isOpen,
    phase,
    sourceText,
    proposedNodes,
    proposedEdges,
    error,
    showSettings,
    settings,
    // Actions
    openModal,
    closeModal,
    setSourceText,
    setShowSettings,
    updateSettings,
    runExtraction,
    cancelExtraction,
    toggleNode,
    toggleEdge,
    updateProposedNode,
    updateProposedEdge,
    acceptAll,
    rejectAll,
    commitAccepted,
    // Allow returning to input phase from error
    retryExtraction: useCallback(() => setPhase('input'), []),
  }
}
