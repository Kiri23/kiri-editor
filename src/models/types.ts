/**
 * Layer 1: Domain Models (DDD primitives)
 * Pure TypeScript — no React, no side effects.
 */

export interface ComponentField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean'
  required?: boolean
  options?: string[]
  defaultValue?: string | number | boolean
}

export interface ComponentDefinition {
  id: string
  name: string
  description: string
  icon: string
  fields: ComponentField[]
}

export interface ComponentInstance {
  id: string
  definitionId: string
  values: Record<string, string | number | boolean>
}

export interface EditorDocument {
  id: string
  title: string
  components: ComponentInstance[]
}
