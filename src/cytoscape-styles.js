// ── Centrality color helper ──
export function interpolateColor(t) {
  if (t < 0.5) {
    const r = Math.round(55 + (245 - 55) * (t * 2))
    const g = Math.round(65 + (158 - 65) * (t * 2))
    const b = Math.round(81 + (11 - 81) * (t * 2))
    return `rgb(${r},${g},${b})`
  }
  const t2 = (t - 0.5) * 2
  const r = Math.round(245 + (239 - 245) * t2)
  const g = Math.round(158 + (68 - 158) * t2)
  const b = Math.round(11 + (68 - 11) * t2)
  return `rgb(${r},${g},${b})`
}

// ── Cytoscape style ──
export const CY_STYLE = [
  // ── Base node style ──
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 8,
      'font-size': 12,
      'font-family': 'ui-monospace, monospace',
      color: '#d1d5db',
      'text-outline-color': '#111827',
      'text-outline-width': 2,
      'background-color': 'data(color)',
      shape: 'data(shape)',
      width: 50,
      height: 50,
      'border-width': 2,
      'border-color': '#374151',
      'transition-property': 'background-color, border-color, opacity, width, height',
      'transition-duration': '0.2s',
    },
  },

  // ── Node with avatar image (Feature 5) ──
  {
    selector: 'node[avatarUrl != ""]',
    style: {
      'background-image': 'data(avatarUrl)',
      'background-fit': 'cover',
      'background-clip': 'node',
    },
  },

  // ── Node states ──
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#f59e0b',
      width: 60,
      height: 60,
    },
  },
  {
    selector: 'node.highlighted',
    style: {
      'border-width': 3,
      'border-color': '#f59e0b',
    },
  },
  {
    selector: 'node.dimmed',
    style: {
      opacity: 0.15,
    },
  },

  // ── Time-filtered state (Feature 1) ──
  {
    selector: '.time-filtered',
    style: {
      opacity: 0.06,
    },
  },

  // ── Query-highlighted state (Feature 10) ──
  {
    selector: '.query-path',
    style: {
      'border-width': 4,
      'border-color': '#06b6d4',
      'line-color': '#06b6d4',
      'target-arrow-color': '#06b6d4',
      'source-arrow-color': '#06b6d4',
    },
  },

  // ── Compound/parent node ──
  {
    selector: ':parent',
    style: {
      'background-color': '#1e293b',
      'background-opacity': 0.7,
      'border-color': '#22c55e',
      'border-width': 2,
      'border-opacity': 0.8,
      shape: 'roundrectangle',
      padding: '30px',
      'text-valign': 'top',
      'text-halign': 'center',
      'text-margin-y': -5,
      'font-size': 14,
      'font-weight': 'bold',
      'compound-sizing-wrt-labels': 'include',
      'min-width': '100px',
      'min-height': '100px',
    },
  },
  {
    selector: ':parent:selected',
    style: {
      'border-color': '#f59e0b',
      'border-width': 3,
    },
  },

  // ── Base edge style ──
  {
    selector: 'edge',
    style: {
      width: 'data(weight)',
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'source-arrow-color': 'data(color)',
      'curve-style': 'bezier',
      label: 'data(label)',
      'font-size': 10,
      'font-family': 'ui-monospace, monospace',
      color: '#9ca3af',
      'text-rotation': 'autorotate',
      'text-outline-color': '#111827',
      'text-outline-width': 2,
      'text-margin-y': -10,
      'transition-property': 'line-color, opacity, width',
      'transition-duration': '0.2s',
      // Default: directed (arrow on target only)
      'target-arrow-shape': 'triangle',
      'source-arrow-shape': 'none',
    },
  },

  // ── Direction styles (Feature 3) ──
  {
    selector: 'edge[direction = "directed"]',
    style: {
      'target-arrow-shape': 'triangle',
      'source-arrow-shape': 'none',
    },
  },
  {
    selector: 'edge[direction = "mutual"]',
    style: {
      'target-arrow-shape': 'triangle',
      'source-arrow-shape': 'triangle',
    },
  },
  {
    selector: 'edge[direction = "undirected"]',
    style: {
      'target-arrow-shape': 'none',
      'source-arrow-shape': 'none',
    },
  },

  // ── Confidence styles (Feature 2) ──
  {
    selector: 'edge[confidence = "Probable"]',
    style: {
      opacity: 0.8,
    },
  },
  {
    selector: 'edge[confidence = "Suspected"]',
    style: {
      'line-style': 'dashed',
      'line-dash-pattern': [8, 4],
      opacity: 0.7,
    },
  },
  {
    selector: 'edge[confidence = "Unconfirmed"]',
    style: {
      'line-style': 'dashed',
      'line-dash-pattern': [4, 4],
      opacity: 0.5,
    },
  },

  // ── Edge states ──
  {
    selector: 'edge.highlighted',
    style: {
      width: 4,
      'line-color': '#f59e0b',
      'target-arrow-color': '#f59e0b',
    },
  },
  {
    selector: 'edge.dimmed',
    style: {
      opacity: 0.1,
    },
  },
]
