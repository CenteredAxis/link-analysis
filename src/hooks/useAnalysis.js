import { useState } from 'react'
import { interpolateColor } from '../cytoscape-styles'

export function useAnalysis(cyRef) {
  const [centralityType, setCentralityType] = useState(null)

  function runCentrality(type) {
    const cy = cyRef.current
    if (!cy || cy.nodes().length === 0) return

    const eles = cy.elements()
    const nodeScores = {}

    if (type === 'degree') {
      cy.nodes().forEach((node) => {
        const result = eles.degreeCentrality({ root: node })
        nodeScores[node.data('id')] = result.degree
      })
    } else if (type === 'closeness') {
      cy.nodes().forEach((node) => {
        const score = eles.closenessCentrality({ root: node })
        nodeScores[node.data('id')] = typeof score === 'number' ? score : 0
      })
    } else if (type === 'betweenness') {
      const bc = eles.betweennessCentrality({})
      cy.nodes().forEach((node) => {
        nodeScores[node.data('id')] = bc.betweennessNormalized(node)
      })
    }

    const values = Object.values(nodeScores)
    const maxScore = Math.max(...values, 0.001)
    const minScore = Math.min(...values)
    const range = maxScore - minScore || 1

    cy.nodes().forEach((node) => {
      const raw = nodeScores[node.data('id')] || 0
      const norm = (raw - minScore) / range
      const size = 30 + norm * 70
      node.style({
        width: size,
        height: size,
        'border-width': 2 + norm * 4,
        'border-color': interpolateColor(norm),
      })
    })

    setCentralityType(type)
  }

  function clearCentrality() {
    const cy = cyRef.current
    if (!cy) return
    cy.nodes().forEach((node) => {
      node.removeStyle('width height border-width border-color')
    })
    setCentralityType(null)
  }

  return { runCentrality, clearCentrality, centralityType }
}
