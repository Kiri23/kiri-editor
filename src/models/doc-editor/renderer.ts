/**
 * Doc Editor — Renders component instances to Markdown with YAML code fences.
 * This is the output format that DocsifyTemplate's component-renderer.js consumes.
 */

import type { ComponentInstance } from '../types'
import { docComponents } from './components'

function toYamlCodeFence(type: string, values: Record<string, string | number | boolean>): string {
  const lines = Object.entries(values)
    .filter(([, v]) => v !== '' && v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
  return `\`\`\`yaml\ntype: ${type}\n${lines.join('\n')}\n\`\`\``
}

function renderTextBlock(values: Record<string, string | number | boolean>): string {
  const parts: string[] = []
  if (values.heading) parts.push(`## ${values.heading}`)
  if (values.content) parts.push(String(values.content))
  return parts.join('\n\n')
}

export function renderDocument(title: string, components: ComponentInstance[]): string {
  const sections = components.map(instance => {
    const def = docComponents.find(d => d.id === instance.definitionId)
    if (!def) return `<!-- Unknown component: ${instance.definitionId} -->`

    if (instance.definitionId === 'text-block') {
      return renderTextBlock(instance.values)
    }

    return toYamlCodeFence(instance.definitionId, instance.values)
  })

  return `# ${title}\n\n${sections.join('\n\n')}`
}
