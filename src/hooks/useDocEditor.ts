/**
 * Layer 3: Headless Hook — Orchestrates the Doc Editor
 * Connects ViewModel state to effects (preview rendering, future: GitHub API publish).
 * Decides WHEN React re-renders.
 */

import { useCallback, useMemo, useState } from 'react'
import type { ComponentDefinition } from '../models/types'
import {
  type EditorState,
  addComponent,
  createEditorState,
  removeComponent,
  selectComponent,
  updateProperty,
} from '../viewmodels/BuilderPalette'
import { docComponents } from '../models/doc-editor/components'
import { renderDocument } from '../models/doc-editor/renderer'

export function useDocEditor() {
  const [state, setState] = useState<EditorState>(() =>
    createEditorState({
      id: crypto.randomUUID(),
      title: 'Untitled Document',
      components: [],
    })
  )

  const palette = useMemo(() => docComponents, [])

  const previewHtml = useMemo(
    () => renderDocument(state.document.title, state.document.components),
    [state.document.title, state.document.components]
  )

  const selectedComponent = useMemo(() => {
    if (!state.selectedComponentId) return null
    return state.document.components.find(c => c.id === state.selectedComponentId) ?? null
  }, [state.selectedComponentId, state.document.components])

  const selectedDefinition = useMemo(() => {
    if (!selectedComponent) return null
    return palette.find(d => d.id === selectedComponent.definitionId) ?? null
  }, [selectedComponent, palette])

  const handleAddComponent = useCallback((def: ComponentDefinition) => {
    setState(s => addComponent(s, def))
  }, [])

  const handleUpdateProperty = useCallback((instanceId: string, key: string, value: string | number | boolean) => {
    setState(s => updateProperty(s, instanceId, key, value))
  }, [])

  const handleRemoveComponent = useCallback((instanceId: string) => {
    setState(s => removeComponent(s, instanceId))
  }, [])

  const handleSelectComponent = useCallback((instanceId: string | null) => {
    setState(s => selectComponent(s, instanceId))
  }, [])

  const handleSetTitle = useCallback((title: string) => {
    setState(s => ({
      ...s,
      document: { ...s.document, title },
      isDirty: true,
    }))
  }, [])

  const handlePublish = useCallback(async () => {
    // TODO: GitHub API commit
    console.log('Publishing...', previewHtml)
  }, [previewHtml])

  return {
    // State (read-only for UI)
    document: state.document,
    selectedComponent,
    selectedDefinition,
    isDirty: state.isDirty,
    previewHtml,
    palette,

    // Commands (UI dispatches these)
    addComponent: handleAddComponent,
    updateProperty: handleUpdateProperty,
    removeComponent: handleRemoveComponent,
    selectComponent: handleSelectComponent,
    setTitle: handleSetTitle,
    publish: handlePublish,
  }
}
