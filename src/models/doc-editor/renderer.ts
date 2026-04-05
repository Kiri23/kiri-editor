/**
 * Doc Editor — Renders component instances to Markdown with YAML code fences.
 * This is the ONLY place that knows about YAML.
 * The Shell sends structured data, this layer serializes it.
 */

import type { ComponentInstance } from '../types'

function serializeValue(value: unknown, indent: number): string {
  const pad = ' '.repeat(indent)

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return '\n' + value.map(item => {
      if (typeof item === 'object' && item !== null) {
        const entries = Object.entries(item)
          .filter(([, v]) => v !== '' && v !== undefined && v !== null)
        if (entries.length === 0) return `${pad}-`
        const [firstKey, firstVal] = entries[0]
        const rest = entries.slice(1)
        const firstLine = `${pad}- ${firstKey}: ${serializeScalar(firstVal)}`
        const restLines = rest.map(([k, v]) => `${pad}  ${k}: ${serializeScalar(v)}`)
        return [firstLine, ...restLines].join('\n')
      }
      return `${pad}- ${item}`
    }).join('\n')
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
      .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    if (entries.length === 0) return '{}'
    return '\n' + entries.map(([k, v]) => `${pad}${k}: ${serializeScalar(v)}`).join('\n')
  }

  return serializeScalar(value)
}

function serializeScalar(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  return String(value ?? '')
}

function toYamlCodeFence(type: string, values: Record<string, unknown>): string {
  const lines = Object.entries(values)
    .filter(([, v]) => {
      if (v === '' || v === undefined || v === null) return false
      if (Array.isArray(v) && v.length === 0) return false
      return true
    })
    .map(([k, v]) => {
      if (Array.isArray(v) || (typeof v === 'object' && v !== null)) {
        return `${k}:${serializeValue(v, 2)}`
      }
      return `${k}: ${serializeScalar(v)}`
    })
  return `\`\`\`${type}\n${lines.join('\n')}\n\`\`\``
}

function renderTextBlock(values: Record<string, unknown>): string {
  const parts: string[] = []
  if (values.heading) parts.push(`## ${values.heading}`)
  if (values.content) parts.push(String(values.content))
  return parts.join('\n\n')
}

export function renderDocument(title: string, components: ComponentInstance[]): string {
  const sections = components.map(instance => {
    if (instance.definitionId === 'text-block') {
      return renderTextBlock(instance.values)
    }
    return toYamlCodeFence(instance.definitionId, instance.values)
  })

  return `# ${title}\n\n${sections.join('\n\n')}`
}
