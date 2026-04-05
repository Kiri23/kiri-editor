/**
 * Doc Editor — Renders component instances to Markdown with YAML code fences.
 * This is the output format that DocsifyTemplate's component-renderer.js consumes.
 */

import type { ComponentInstance } from '../types'

function toYamlCodeFence(type: string, values: Record<string, string | number | boolean>): string {
  const lines = Object.entries(values)
    .filter(([, v]) => v !== '' && v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
  // Use component name as the code fence language — this is how DocsifyTemplate identifies them
  return `\`\`\`${type}\n${lines.join('\n')}\n\`\`\``
}

function renderTextBlock(values: Record<string, string | number | boolean>): string {
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
