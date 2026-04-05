/**
 * JSON Schema → ComponentDefinition parser
 *
 * Converts valid JSON Schema (with x-ui extensions) into the
 * ComponentDefinition format that the Shell understands.
 * The Shell never touches JSON Schema directly.
 */

import type { ComponentDefinition, ComponentField } from '../models/types'

interface JsonSchemaProperty {
  type?: string
  default?: unknown
  enum?: string[]
  items?: { type?: string; properties?: Record<string, JsonSchemaProperty>; required?: string[] }
  properties?: Record<string, JsonSchemaProperty>
  required?: string[]
  'x-ui'?: { label?: string; widget?: string; order?: number }
}

interface JsonSchema {
  $id?: string
  properties?: Record<string, JsonSchemaProperty>
  required?: string[]
  'x-ui'?: {
    name?: string
    description?: string
    icon?: string
    display?: Record<string, string>
  }
}

function parseField(key: string, prop: JsonSchemaProperty, isRequired: boolean): ComponentField {
  const ui = prop['x-ui'] ?? {}
  const fieldType = prop.type as ComponentField['type'] ?? 'string'

  const field: ComponentField = {
    key,
    label: ui.label ?? key,
    type: fieldType,
    required: isRequired || undefined,
    default: prop.default,
  }

  if (prop.enum) field.enum = prop.enum
  if (ui.widget === 'textarea') field.widget = 'textarea'

  // Parse sub-fields for arrays and objects
  if (fieldType === 'array' && prop.items?.properties) {
    const itemRequired = prop.items.required ?? []
    field.items = Object.entries(prop.items.properties)
      .map(([k, p]) => parseField(k, p, itemRequired.includes(k)))
  }

  if (fieldType === 'object' && prop.properties) {
    const objRequired = prop.required ?? []
    field.items = Object.entries(prop.properties)
      .map(([k, p]) => parseField(k, p, objRequired.includes(k)))
  }

  return field
}

export function parseJsonSchema(schema: JsonSchema): ComponentDefinition {
  const ui = schema['x-ui'] ?? {}
  const requiredKeys = schema.required ?? []
  const properties = schema.properties ?? {}

  const fields = Object.entries(properties)
    .map(([key, prop]) => parseField(key, prop, requiredKeys.includes(key)))
    .sort((a, b) => {
      const orderA = properties[a.key]?.['x-ui']?.order ?? 99
      const orderB = properties[b.key]?.['x-ui']?.order ?? 99
      return orderA - orderB
    })

  return {
    id: schema.$id ?? 'unknown',
    name: ui.name ?? schema.$id ?? 'Unknown',
    description: ui.description ?? '',
    icon: ui.icon ?? '',
    fields,
    display: ui.display,
  }
}
