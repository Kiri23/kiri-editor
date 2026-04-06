/**
 * Doc Editor — Parses Markdown with YAML code fences into ComponentInstances.
 * The reverse of renderer.ts.
 *
 * Input:  "# Title\n\nSome text\n\n```entity-schema\nname: User\n```"
 * Output: { title, components: [{ definitionId: "text-block", values: {...} }, { definitionId: "entity-schema", values: {...} }] }
 *
 * This is the ONLY place that knows how to read YAML back into structured data.
 */

import type { ComponentInstance } from '../types'

interface ParsedDocument {
  title: string
  components: ComponentInstance[]
}

// Matches ```component-name\n...\n```
const CODE_FENCE_REGEX = /^```(\S+)\n([\s\S]*?)^```$/gm

// Simple YAML parser for flat + one-level nested structures
// Handles: key: value, arrays with -, nested objects in arrays
function parseYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const lines = yaml.split('\n')
  let currentKey: string | null = null
  let currentArray: Record<string, unknown>[] | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Array item: "  - name: value" or "- name: value"
    const arrayItemMatch = line.match(/^(\s*)- (\w+):\s*(.*)$/)
    if (arrayItemMatch && currentKey) {
      const value = arrayItemMatch[3].trim()
      const item: Record<string, unknown> = { [arrayItemMatch[2]]: parseScalar(value) }

      // Read continuation lines for this array item (indented key: value)
      const itemIndent = arrayItemMatch[1].length + 2
      while (i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        const contMatch = nextLine.match(/^(\s+)(\w+):\s*(.*)$/)
        if (contMatch && contMatch[1].length >= itemIndent && !nextLine.trimStart().startsWith('-')) {
          item[contMatch[2]] = parseScalar(contMatch[3].trim())
          i++
        } else {
          break
        }
      }

      if (!currentArray) currentArray = []
      currentArray.push(item)
      continue
    }

    // Simple array item: "  - value"
    const simpleArrayMatch = line.match(/^\s+- (.+)$/)
    if (simpleArrayMatch && currentKey) {
      if (!currentArray) currentArray = []
      currentArray.push(parseScalar(simpleArrayMatch[1].trim()) as Record<string, unknown>)
      continue
    }

    // Top-level key with no value (array or object follows)
    const keyOnlyMatch = line.match(/^(\w[\w-]*):\s*$/)
    if (keyOnlyMatch) {
      // Save previous array
      if (currentKey && currentArray) {
        result[currentKey] = currentArray
        currentArray = null
      }
      currentKey = keyOnlyMatch[1]
      currentArray = []
      continue
    }

    // Top-level key: value
    const kvMatch = line.match(/^(\w[\w-]*):\s+(.+)$/)
    if (kvMatch) {
      // Save previous array
      if (currentKey && currentArray) {
        result[currentKey] = currentArray
        currentArray = null
        currentKey = null
      }
      result[kvMatch[1]] = parseScalar(kvMatch[2].trim())
      continue
    }
  }

  // Save last array
  if (currentKey && currentArray) {
    result[currentKey] = currentArray
  }

  return result
}

function parseScalar(value: string): unknown {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === '') return ''
  const num = Number(value)
  if (!isNaN(num) && value !== '') return num
  return value
}

export function parseMarkdown(markdown: string): ParsedDocument {
  let title = ''
  const components: ComponentInstance[] = []

  // Strip frontmatter (---\n...\n---)
  let stripped = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '').trim()

  // Extract title from first # heading
  const titleMatch = stripped.match(/^# (.+)$/m)
  if (titleMatch) {
    title = titleMatch[1].trim()
  }

  // Remove the title line for processing
  let content = stripped.replace(/^# .+$/m, '').trim()

  // Find all code fences and split content around them
  let lastIndex = 0
  const fenceMatches: Array<{ index: number; length: number; type: string; yaml: string }> = []

  let match: RegExpExecArray | null
  CODE_FENCE_REGEX.lastIndex = 0
  while ((match = CODE_FENCE_REGEX.exec(content)) !== null) {
    fenceMatches.push({
      index: match.index,
      length: match[0].length,
      type: match[1],
      yaml: match[2],
    })
  }

  for (const fence of fenceMatches) {
    // Text before this fence
    const textBefore = content.slice(lastIndex, fence.index).trim()
    if (textBefore) {
      addTextBlock(components, textBefore)
    }

    // The component from the fence
    const values = parseYaml(fence.yaml)
    components.push({
      id: crypto.randomUUID(),
      definitionId: fence.type,
      values,
    })

    lastIndex = fence.index + fence.length
  }

  // Text after the last fence
  const textAfter = content.slice(lastIndex).trim()
  if (textAfter) {
    addTextBlock(components, textAfter)
  }

  // If no fences found, entire content is a text block
  if (fenceMatches.length === 0 && content) {
    addTextBlock(components, content)
  }

  return { title, components }
}

function addTextBlock(components: ComponentInstance[], text: string) {
  // Try to extract a heading from the text
  const headingMatch = text.match(/^## (.+)$/m)
  const heading = headingMatch ? headingMatch[1].trim() : ''
  const body = text.replace(/^## .+$/m, '').trim()

  if (!heading && !body) return

  components.push({
    id: crypto.randomUUID(),
    definitionId: 'text-block',
    values: {
      ...(heading ? { heading } : {}),
      content: body,
    },
  })
}
