/**
 * Layer 1: Domain Models (DDD primitives)
 * Pure TypeScript — no React, no side effects.
 */

export interface ComponentField {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required?: boolean
  enum?: string[]
  default?: unknown
  widget?: 'textarea'
  items?: ComponentField[]  // sub-fields for array items or object properties
}

export interface ComponentDefinition {
  id: string
  name: string
  description: string
  icon: string
  fields: ComponentField[]
  display?: Record<string, string>
}

export interface ComponentInstance {
  id: string
  definitionId: string
  values: Record<string, unknown>
}

export interface EditorDocument {
  id: string
  title: string
  components: ComponentInstance[]
}
