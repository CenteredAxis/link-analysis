import {
  NODE_TYPES, RELATIONSHIP_TYPES, CONFIDENCE_LEVELS,
  EDGE_DIRECTIONS, NODE_SHAPES, NODE_COLORS, RELATIONSHIP_COLORS,
} from '../constants'

/**
 * Attempt to fix common JSON errors produced by LLMs:
 * - Single-quoted strings → double-quoted
 * - Trailing commas before } or ]
 * - // and /* comments
 * - Unquoted property names
 * - Truncated JSON (missing closing brackets)
 */
function sanitizeJSON(str) {
  let s = str

  // Remove single-line comments (// ...)
  s = s.replace(/\/\/[^\n]*/g, '')

  // Remove multi-line comments (/* ... */)
  s = s.replace(/\/\*[\s\S]*?\*\//g, '')

  // Replace single-quoted strings with double-quoted strings.
  // Walk character-by-character to avoid mangling apostrophes inside double-quoted strings.
  let result = ''
  let inDouble = false
  let inSingle = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const prev = i > 0 ? s[i - 1] : ''

    if (ch === '"' && !inSingle && prev !== '\\') {
      inDouble = !inDouble
      result += ch
    } else if (ch === "'" && !inDouble && prev !== '\\') {
      if (!inSingle) {
        inSingle = true
        result += '"'
      } else {
        inSingle = false
        result += '"'
      }
    } else {
      result += ch
    }
  }
  s = result

  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, '$1')

  // Quote unquoted property names: word before colon that isn't already quoted
  s = s.replace(/(?<=[\{,]\s*)([a-zA-Z_]\w*)\s*:/g, '"$1":')

  // Attempt to fix truncated JSON by balancing brackets
  let braces = 0
  let brackets = 0
  for (const ch of s) {
    if (ch === '{') braces++
    else if (ch === '}') braces--
    else if (ch === '[') brackets++
    else if (ch === ']') brackets--
  }
  // Close any unclosed arrays then objects
  while (brackets > 0) { s += ']'; brackets-- }
  while (braces > 0) { s += '}'; braces-- }

  return s
}

/**
 * Parse raw AI response string into validated nodes and edges.
 * Handles common LLM quirks: markdown fences, trailing text, partial JSON.
 */
export function parseAIResponse(rawContent) {
  let cleaned = rawContent.trim()

  // Strip markdown code fences
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
  cleaned = cleaned.trim()

  // Attempt JSON parse
  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    // Fallback: try to extract a JSON object from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch {
        // Final fallback: sanitize common LLM JSON errors and retry
        try {
          parsed = JSON.parse(sanitizeJSON(jsonMatch[0]))
        } catch (e2) {
          throw new Error(`Failed to parse AI response as JSON: ${e2.message}`)
        }
      }
    } else {
      throw new Error(`AI response is not valid JSON: ${e.message}`)
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response is not a JSON object')
  }

  const rawNodes = Array.isArray(parsed.nodes) ? parsed.nodes : []
  const rawEdges = Array.isArray(parsed.edges) ? parsed.edges : []

  // Use a counter to ensure unique temp IDs even within the same millisecond
  let counter = 0

  // Validate and normalize nodes
  const nodes = rawNodes
    .filter((n) => n.label && typeof n.label === 'string' && n.label.trim())
    .map((n) => {
      const nodeType = NODE_TYPES.includes(n.nodeType) ? n.nodeType : 'Person'
      return {
        _tempId: `n${Date.now()}${counter++}`,
        label: n.label.trim(),
        nodeType,
        metadata: n.metadata || '',
        role: n.role || '',
        aliases: n.aliases || '',
        status: n.status || '',
        location: n.location || '',
        dob: n.dob || '',
        avatarUrl: '',
        eventType: n.eventType || '',
        eventDate: n.eventDate || '',
        eventLocation: n.eventLocation || '',
        eventDescription: n.eventDescription || '',
        // Visual props for preview
        shape: NODE_SHAPES[nodeType],
        color: NODE_COLORS[nodeType],
        // Review state: null=pending, true=accepted, false=rejected
        accepted: null,
      }
    })

  // Build label -> tempId lookup for edge resolution
  const labelMap = {}
  nodes.forEach((n) => {
    labelMap[n.label.toLowerCase()] = n._tempId
  })

  // Validate and normalize edges
  const edges = rawEdges
    .filter((e) => {
      const srcKey = (e.sourceLabel || '').trim().toLowerCase()
      const tgtKey = (e.targetLabel || '').trim().toLowerCase()
      return srcKey && tgtKey && labelMap[srcKey] && labelMap[tgtKey]
    })
    .map((e) => {
      const relationship = RELATIONSHIP_TYPES.includes(e.relationship)
        ? e.relationship
        : 'Unknown'
      const confidence = CONFIDENCE_LEVELS.includes(e.confidence)
        ? e.confidence
        : 'Probable'
      const direction = EDGE_DIRECTIONS.includes(e.direction)
        ? e.direction
        : 'directed'
      const srcKey = e.sourceLabel.trim().toLowerCase()
      const tgtKey = e.targetLabel.trim().toLowerCase()

      return {
        _tempId: `e${Date.now()}${counter++}`,
        sourceTempId: labelMap[srcKey],
        targetTempId: labelMap[tgtKey],
        sourceLabel: e.sourceLabel.trim(),
        targetLabel: e.targetLabel.trim(),
        relationship,
        customLabel: e.customLabel || '',
        description: e.description || '',
        confidence,
        direction,
        weight: typeof e.weight === 'number'
          ? Math.min(8, Math.max(1, Math.round(e.weight)))
          : 2,
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        eventDate: e.eventDate || '',
        location: e.location || '',
        // Visual props for preview
        color: RELATIONSHIP_COLORS[relationship] || RELATIONSHIP_COLORS.Unknown,
        // Review state
        accepted: null,
      }
    })

  return { nodes, edges }
}
