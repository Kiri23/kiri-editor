/**
 * Layer 2: ViewModel — BuilderPalette interface
 * Pure state + logic. No React, no side effects.
 * Reusable across different products (Doc Editor, Resume Builder, Blog Editor).
 */

import type { ComponentDefinition, ComponentField, ComponentInstance, EditorDocument } from '../models/types'

export interface BuilderPalette {
  getComponents(): ComponentDefinition[]
  getProperties(instanceId: string): ComponentField[]
  updateProperty(instanceId: string, key: string, value: string | number | boolean): void
  preview(): string
  publish(): Promise<void>
}

export interface EditorState {
  document: EditorDocument
  selectedComponentId: string | null
  isDirty: boolean
  previewHtml: string
}

export function createEditorState(doc: EditorDocument): EditorState {
  return {
    document: doc,
    selectedComponentId: null,
    isDirty: false,
    previewHtml: '',
  }
}

export function addComponent(
  state: EditorState,
  definition: ComponentDefinition,
): EditorState {
  const instance: ComponentInstance = {
    id: crypto.randomUUID(),
    definitionId: definition.id,
    values: Object.fromEntries(
      definition.fields
        .filter(f => f.defaultValue !== undefined)
        .map(f => [f.key, f.defaultValue!])
    ),
  }
  return {
    ...state,
    document: {
      ...state.document,
      components: [...state.document.components, instance],
    },
    selectedComponentId: instance.id,
    isDirty: true,
  }
}

export function updateProperty(
  state: EditorState,
  instanceId: string,
  key: string,
  value: string | number | boolean,
): EditorState {
  return {
    ...state,
    document: {
      ...state.document,
      components: state.document.components.map(c =>
        c.id === instanceId
          ? { ...c, values: { ...c.values, [key]: value } }
          : c
      ),
    },
    isDirty: true,
  }
}

export function removeComponent(
  state: EditorState,
  instanceId: string,
): EditorState {
  return {
    ...state,
    document: {
      ...state.document,
      components: state.document.components.filter(c => c.id !== instanceId),
    },
    selectedComponentId:
      state.selectedComponentId === instanceId ? null : state.selectedComponentId,
    isDirty: true,
  }
}

export function selectComponent(
  state: EditorState,
  instanceId: string | null,
): EditorState {
  return { ...state, selectedComponentId: instanceId }
}
