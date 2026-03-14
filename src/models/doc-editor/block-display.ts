/**
 * Block Display Configuration
 *
 * Controls the visual personality of each block type on the canvas.
 * Swap this config to change how blocks look without touching components.
 *
 * Layout variants:
 *   "prose"    — minimal, content-forward (for text-heavy blocks)
 *   "badge"    — prominent badge/tag + path (for API endpoints)
 *   "entity"   — name as title + field count indicator
 *   "diagram"  — title + participant pills
 */

export interface BlockDisplayConfig {
  /** CSS color variable for this type */
  color: string
  /** Layout variant — controls internal structure */
  layout: 'prose' | 'badge' | 'entity' | 'diagram'
  /** SVG icon path (16x16 viewBox) */
  icon: string
  /** How to extract the summary line from instance values */
  summary: (values: Record<string, string | number | boolean>) => string
  /** Optional: extract a badge label (e.g., HTTP method) */
  badge?: (values: Record<string, string | number | boolean>) => string | null
  /** Optional: extract a list of pills (e.g., participants) */
  pills?: (values: Record<string, string | number | boolean>) => string[]
  /** Optional: extract a count indicator (e.g., field count) */
  count?: (values: Record<string, string | number | boolean>) => { label: string; n: number } | null
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'var(--success)',
  POST: 'var(--blueprint)',
  PUT: 'var(--draft)',
  PATCH: 'var(--draft)',
  DELETE: 'var(--danger)',
}

export function getMethodColor(method: string): string {
  return METHOD_COLORS[method.toUpperCase()] ?? 'var(--ink-tertiary)'
}

export const blockDisplay: Record<string, BlockDisplayConfig> = {
  'text-block': {
    color: 'var(--type-text)',
    layout: 'prose',
    icon: 'M3 4h10M3 8h7M3 12h9',
    summary: (v) => {
      const content = String(v.content ?? '')
      const heading = String(v.heading ?? '')
      if (heading) return heading
      return content.slice(0, 140) || 'Empty text block'
    },
  },

  'api-endpoint': {
    color: 'var(--type-api)',
    layout: 'badge',
    icon: 'M2 8h12M8 3v10',
    summary: (v) => String(v.path ?? '/...'),
    badge: (v) => {
      const m = String(v.method ?? '')
      return m || null
    },
  },

  'entity-schema': {
    color: 'var(--type-schema)',
    layout: 'entity',
    icon: 'M3 2h10v12H3zM6 5h4M6 8h4M6 11h3',
    summary: (v) => String(v.name ?? 'Unnamed model'),
    count: (v) => {
      const fields = String(v.fields ?? '')
      if (!fields.trim()) return null
      const lines = fields.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'))
      return { label: 'properties', n: lines.length }
    },
  },

  'sequence-diagram': {
    color: 'var(--type-diagram)',
    layout: 'diagram',
    icon: 'M3 3v10M13 3v10M3 6h10M3 10h10',
    summary: (v) => String(v.title ?? 'Unnamed flow'),
    pills: (v) => {
      const actors = String(v.actors ?? '')
      return actors.split(',').map(a => a.trim()).filter(Boolean)
    },
  },
}

/**
 * Get display config for a block type. Falls back to a generic config.
 */
export function getBlockDisplay(definitionId: string): BlockDisplayConfig {
  return blockDisplay[definitionId] ?? {
    color: 'var(--type-text)',
    layout: 'prose',
    icon: 'M3 4h10M3 8h7M3 12h9',
    summary: () => definitionId,
  }
}
