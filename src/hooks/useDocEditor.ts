/**
 * Layer 3: Headless Hook — Orchestrates the Doc Editor
 *
 * Connects ViewModel (pure state) to effects (Convex DB, future GitHub API).
 * The hook decides WHEN React re-renders and WHEN to persist.
 *
 * Flow:
 * 1. On mount: getOrCreate project → load or create first document
 * 2. On edit: update local state immediately (optimistic)
 * 3. On save: persist to Convex
 * 4. On publish: (future) commit to GitHub
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
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
      id: 'loading',
      title: 'Untitled Document',
      components: [],
    })
  )
  const [projectId, setProjectId] = useState<Id<'projects'> | null>(null)
  const [documentId, setDocumentId] = useState<Id<'documents'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Convex mutations
  const getOrCreateProject = useMutation(api.projects.getOrCreate)
  const createDocument = useMutation(api.documents.create)
  const updateDocument = useMutation(api.documents.update)

  // Convex queries — reactive, auto-update when DB changes
  const documents = useQuery(
    api.documents.list,
    projectId ? { projectId } : 'skip'
  )

  // Auto-save debounce ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Bootstrap: ensure project + document exist ---
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const pid = await getOrCreateProject()
      if (cancelled) return
      setProjectId(pid)
    }

    bootstrap()
    return () => { cancelled = true }
  }, [getOrCreateProject])

  // Once we have documents list, load or create first doc
  useEffect(() => {
    if (!projectId || documents === undefined) return
    if (documentId) return // already loaded

    let cancelled = false

    async function loadOrCreate() {
      if (documents && documents.length > 0) {
        const doc = documents[0]
        if (cancelled) return
        setDocumentId(doc._id)
        setState(createEditorState({
          id: doc._id,
          title: doc.title,
          components: (doc.components ?? []).map(c => ({
            id: c.id,
            definitionId: c.definitionId,
            values: c.values as Record<string, string | number | boolean>,
          })),
        }))
      } else if (projectId) {
        const docId = await createDocument({
          projectId,
          title: 'Untitled Document',
          path: 'docs/untitled.md',
          branch: 'main',
        })
        if (cancelled) return
        setDocumentId(docId)
        setState(createEditorState({
          id: docId,
          title: 'Untitled Document',
          components: [],
        }))
      }
      if (!cancelled) setIsLoading(false)
    }

    loadOrCreate()
    return () => { cancelled = true }
  }, [projectId, documents, documentId, createDocument])

  // --- Auto-save: debounce writes to Convex ---
  const persistToConvex = useCallback(() => {
    if (!documentId) return

    setState(s => {
      if (!s.isDirty) return s

      updateDocument({
        id: documentId,
        title: s.document.title,
        components: s.document.components.map(c => ({
          id: c.id,
          definitionId: c.definitionId,
          values: c.values,
        })),
      })

      return { ...s, isDirty: false }
    })
  }, [documentId, updateDocument])

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(persistToConvex, 1000)
  }, [persistToConvex])

  // --- ViewModel + palette (unchanged) ---
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

  // --- Commands: update local state, schedule save ---
  const handleAddComponent = useCallback((def: ComponentDefinition) => {
    setState(s => addComponent(s, def))
    scheduleSave()
  }, [scheduleSave])

  const handleUpdateProperty = useCallback((instanceId: string, key: string, value: string | number | boolean) => {
    setState(s => updateProperty(s, instanceId, key, value))
    scheduleSave()
  }, [scheduleSave])

  const handleRemoveComponent = useCallback((instanceId: string) => {
    setState(s => removeComponent(s, instanceId))
    scheduleSave()
  }, [scheduleSave])

  const handleSelectComponent = useCallback((instanceId: string | null) => {
    setState(s => selectComponent(s, instanceId))
  }, [])

  const handleSetTitle = useCallback((title: string) => {
    setState(s => ({
      ...s,
      document: { ...s.document, title },
      isDirty: true,
    }))
    scheduleSave()
  }, [scheduleSave])

  const handlePublish = useCallback(async () => {
    // Save first, then publish
    persistToConvex()
    // TODO: GitHub API commit
    console.log('Publishing...', previewHtml)
  }, [persistToConvex, previewHtml])

  return {
    // State
    document: state.document,
    selectedComponent,
    selectedDefinition,
    isDirty: state.isDirty,
    isLoading,
    previewHtml,
    palette,

    // Commands
    addComponent: handleAddComponent,
    updateProperty: handleUpdateProperty,
    removeComponent: handleRemoveComponent,
    selectComponent: handleSelectComponent,
    setTitle: handleSetTitle,
    publish: handlePublish,
  }
}
