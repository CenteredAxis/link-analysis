import { META_STORAGE_KEY } from './constants'

/**
 * Migrate graph data from v1 to v2 schema.
 * Adds default values for all new fields introduced by the 12 features.
 * Non-destructive: existing fields are never modified.
 */
export function migrateGraphData(saved) {
  if (!saved) return null

  const version = saved.schemaVersion || 1

  if (version < 2) {
    // Walk elements and add defaults for new fields
    const elements = saved.elements
    if (elements) {
      // Handle both array and object formats
      const nodes = Array.isArray(elements)
        ? elements.filter(e => e.group === 'nodes')
        : (elements.nodes || [])
      const edges = Array.isArray(elements)
        ? elements.filter(e => e.group === 'edges')
        : (elements.edges || [])

      nodes.forEach(n => {
        const d = n.data
        // Person-specific defaults (Feature 5)
        if (d.role === undefined) d.role = ''
        if (d.aliases === undefined) d.aliases = ''
        if (d.status === undefined) d.status = ''
        if (d.avatarUrl === undefined) d.avatarUrl = ''
        if (d.location === undefined) d.location = ''
        if (d.dob === undefined) d.dob = ''
        // Event-specific defaults (Feature 8)
        if (d.eventType === undefined) d.eventType = ''
        if (d.eventDate === undefined) d.eventDate = ''
        if (d.eventLocation === undefined) d.eventLocation = ''
        if (d.eventDescription === undefined) d.eventDescription = ''
        // Tags/Groups (Feature 7)
        if (d.tags === undefined) d.tags = '[]'
      })

      edges.forEach(e => {
        const d = e.data
        // Direction (Feature 3)
        if (d.direction === undefined) d.direction = 'directed'
        // Custom label (Feature 12)
        if (d.customLabel === undefined) d.customLabel = ''
        // Temporal (Feature 1)
        if (d.startDate === undefined) d.startDate = ''
        if (d.endDate === undefined) d.endDate = ''
        if (d.eventDate === undefined) d.eventDate = ''
        // Evidence (Feature 2)
        if (d.description === undefined) d.description = ''
        if (d.evidenceRef === undefined) d.evidenceRef = ''
        if (d.confidence === undefined) d.confidence = 'Confirmed'
        // Evidence items (Feature 6)
        if (d.evidenceItems === undefined) d.evidenceItems = '[]'
        // Location (Feature 9)
        if (d.location === undefined) d.location = ''
      })
    }

    saved.schemaVersion = 2
  }

  return saved
}

/**
 * Initialize or load board-level meta data.
 * This data lives outside Cytoscape (groups, annotations, timeline state).
 */
export function migrateMetaData() {
  const raw = localStorage.getItem(META_STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      // Fall through to default
    }
  }
  return {
    schemaVersion: 2,
    groups: [],
    annotations: [],
    timelineRange: { start: null, end: null },
  }
}
