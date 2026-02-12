import { useEffect, useRef } from 'react'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import cxtmenu from 'cytoscape-cxtmenu'
import { CY_STYLE } from '../cytoscape-styles'
import { NODE_SHAPES, NODE_COLORS, RELATIONSHIP_COLORS } from '../constants'
import { loadGraph } from '../storage'

cytoscape.use(fcose)
cytoscape.use(cxtmenu)

/**
 * Encapsulates Cytoscape initialization, event binding, context menus,
 * and the stable-ref pattern for callbacks.
 *
 * @param {React.RefObject} containerRef - Ref to the DOM container for Cytoscape
 * @param {object} callbacks - Object with callback refs for actions
 *   { syncStateRef, startEditNodeRef, startEditEdgeRef, deleteElementRef,
 *     setActiveTabRef, setEdgeFormRef, runLayoutRef, clearHighlightsRef, setSelectedRef }
 * @returns {{ cyRef: React.RefObject }}
 */
export function useCytoscape(containerRef, callbacks) {
  const cyRef = useRef(null)

  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      style: CY_STYLE,
      layout: { name: 'preset' },
      minZoom: 0.2,
      maxZoom: 4,
      wheelSensitivity: 0.3,
    })
    cyRef.current = cy

    // Restore from localStorage
    const saved = loadGraph()
    if (saved && saved.elements) {
      try {
        cy.json({ elements: saved.elements })
        cy.nodes().forEach((n) => {
          n.data('shape', NODE_SHAPES[n.data('nodeType')] || 'ellipse')
          n.data('color', NODE_COLORS[n.data('nodeType')] || '#6b7280')
        })
        cy.edges().forEach((e) => {
          e.data(
            'color',
            RELATIONSHIP_COLORS[e.data('relationship')] || RELATIONSHIP_COLORS.Unknown
          )
          e.data('label', e.data('customLabel') || e.data('relationship'))
        })
      } catch {
        // Failed to restore — start fresh
      }
    }

    // Click on node → highlight neighborhood
    cy.on('tap', 'node', (evt) => {
      const node = evt.target
      if (callbacks.clearHighlightsRef.current) callbacks.clearHighlightsRef.current(cy)

      const neighborhood = node.neighborhood().add(node)
      cy.elements().not(neighborhood).addClass('dimmed')
      neighborhood.addClass('highlighted')

      const data = node.data()
      if (callbacks.setSelectedRef.current) {
        callbacks.setSelectedRef.current({
          type: 'node',
          id: data.id,
          label: data.label,
          nodeType: data.nodeType,
          metadata: data.metadata,
          // Person fields
          role: data.role,
          aliases: data.aliases,
          status: data.status,
          avatarUrl: data.avatarUrl,
          location: data.location,
          dob: data.dob,
          // Event fields
          eventType: data.eventType,
          eventDate: data.eventDate,
          eventLocation: data.eventLocation,
          eventDescription: data.eventDescription,
          // Tags
          tags: data.tags,
          isChild: node.isChild(),
          parentId: node.isChild() ? node.parent().first().data('id') : null,
          parentLabel: node.isChild() ? node.parent().first().data('label') : null,
          connections: node.connectedEdges().map((e) => ({
            id: e.data('id'),
            label: e.data('label'),
            source: e.data('source'),
            target: e.data('target'),
            sourceLabel: cy.getElementById(e.data('source')).data('label'),
            targetLabel: cy.getElementById(e.data('target')).data('label'),
          })),
        })
      }
    })

    // Click on edge → show edge details
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target
      if (callbacks.clearHighlightsRef.current) callbacks.clearHighlightsRef.current(cy)

      const data = edge.data()
      const src = cy.getElementById(data.source)
      const tgt = cy.getElementById(data.target)
      edge.addClass('highlighted')
      src.addClass('highlighted')
      tgt.addClass('highlighted')
      cy.elements().not(edge).not(src).not(tgt).addClass('dimmed')

      if (callbacks.setSelectedRef.current) {
        callbacks.setSelectedRef.current({
          type: 'edge',
          id: data.id,
          label: data.label,
          relationship: data.relationship,
          weight: data.weight,
          sourceLabel: src.data('label'),
          targetLabel: tgt.data('label'),
          // Phase 1 fields
          direction: data.direction,
          customLabel: data.customLabel,
          description: data.description,
          evidenceRef: data.evidenceRef,
          confidence: data.confidence,
          startDate: data.startDate,
          endDate: data.endDate,
          eventDate: data.eventDate,
          evidenceItems: data.evidenceItems,
          location: data.location,
        })
      }
    })

    // Click on background → clear
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        if (callbacks.clearHighlightsRef.current) callbacks.clearHighlightsRef.current(cy)
        if (callbacks.setSelectedRef.current) callbacks.setSelectedRef.current(null)
      }
    })

    // Save on drag
    cy.on('dragfree', 'node', () => {
      if (callbacks.syncStateRef.current) callbacks.syncStateRef.current()
    })

    // Context menu — nodes
    cy.cxtmenu({
      selector: 'node',
      commands: [
        {
          content: 'Edit',
          select: (ele) => {
            ele.emit('tap')
            if (callbacks.startEditNodeRef.current) callbacks.startEditNodeRef.current(ele.data('id'))
          },
          fillColor: 'rgba(245, 158, 11, 0.75)',
        },
        {
          content: 'Delete',
          select: (ele) => {
            if (callbacks.deleteElementRef.current) callbacks.deleteElementRef.current(ele.data('id'))
          },
          fillColor: 'rgba(239, 68, 68, 0.75)',
        },
        {
          content: 'Connect',
          select: (ele) => {
            if (callbacks.setActiveTabRef.current) callbacks.setActiveTabRef.current('edges')
            if (callbacks.setEdgeFormRef.current)
              callbacks.setEdgeFormRef.current((f) => ({ ...f, source: ele.data('id') }))
          },
          fillColor: 'rgba(34, 197, 94, 0.75)',
        },
      ],
      fillColor: 'rgba(17, 24, 39, 0.9)',
      activeFillColor: 'rgba(245, 158, 11, 0.5)',
      activePadding: 10,
      indicatorSize: 16,
      separatorWidth: 3,
      spotlightPadding: 4,
      adaptativeNodeSpotlightRadius: true,
      minSpotlightRadius: 16,
      maxSpotlightRadius: 30,
      itemColor: 'white',
      itemTextShadowColor: 'transparent',
    })

    // Context menu — edges
    cy.cxtmenu({
      selector: 'edge',
      commands: [
        {
          content: 'Edit',
          select: (ele) => {
            ele.emit('tap')
            if (callbacks.startEditEdgeRef.current) callbacks.startEditEdgeRef.current(ele.data('id'))
          },
          fillColor: 'rgba(245, 158, 11, 0.75)',
        },
        {
          content: 'Delete',
          select: (ele) => {
            if (callbacks.deleteElementRef.current) callbacks.deleteElementRef.current(ele.data('id'))
          },
          fillColor: 'rgba(239, 68, 68, 0.75)',
        },
      ],
      fillColor: 'rgba(17, 24, 39, 0.9)',
      activeFillColor: 'rgba(245, 158, 11, 0.5)',
      activePadding: 10,
      indicatorSize: 16,
      separatorWidth: 3,
      itemColor: 'white',
      itemTextShadowColor: 'transparent',
    })

    // Context menu — background
    cy.cxtmenu({
      selector: 'core',
      commands: [
        {
          content: 'Add Node',
          select: () => {
            if (callbacks.setActiveTabRef.current) callbacks.setActiveTabRef.current('nodes')
          },
          fillColor: 'rgba(59, 130, 246, 0.75)',
        },
        {
          content: 'Fit View',
          select: () => {
            cy.fit(undefined, 50)
          },
          fillColor: 'rgba(107, 114, 128, 0.75)',
        },
        {
          content: 'Re-Layout',
          select: () => {
            if (callbacks.runLayoutRef.current) callbacks.runLayoutRef.current()
          },
          fillColor: 'rgba(107, 114, 128, 0.75)',
        },
      ],
      fillColor: 'rgba(17, 24, 39, 0.9)',
      activeFillColor: 'rgba(245, 158, 11, 0.5)',
      activePadding: 10,
      indicatorSize: 16,
      separatorWidth: 3,
      itemColor: 'white',
      itemTextShadowColor: 'transparent',
    })

    // Sync sidebar after restore
    if (callbacks.syncStateRef.current) callbacks.syncStateRef.current()

    return () => cy.destroy()
  }, [])

  return { cyRef }
}
