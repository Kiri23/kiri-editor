/**
 * Layer 3: Headless Hook — Orchestrates the Doc Editor
 *
 * Connects ViewModel (pure state) to effects (Convex DB, future GitHub API).
 * The hook decides WHEN React re-renders and WHEN to persist.
 *
 * Flow:
 * 1. On mount: getOrCreate project → load or create first document
 * 2. On edit: update local state immediately (optimistic)
 * 3. On save: persist to Convex (1s debounce)
 * 4. On switch: save current, load next
 * 5. On publish: (future) commit to GitHub
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { ComponentDefinition } from '../models/types'
import {
  type EditorState,
  addComponent,
  insertComponentAt,
  createEditorState,
  removeComponent,
  selectComponent,
  updateProperty,
} from '../viewmodels/BuilderPalette'
import { docComponents } from '../models/doc-editor/components'
import { renderDocument } from '../models/doc-editor/renderer'

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled'
}

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
  const createDocumentMut = useMutation(api.documents.create)
  const updateDocument = useMutation(api.documents.update)
  const removeDocument = useMutation(api.documents.remove)

  // Convex queries — reactive
  const documents = useQuery(
    api.documents.list,
    projectId ? { projectId } : 'skip'
  )

  // Auto-save debounce ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Bootstrap: ensure project exists ---
  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      const pid = await getOrCreateProject()
      if (!cancelled) setProjectId(pid)
    }
    bootstrap()
    return () => { cancelled = true }
  }, [getOrCreateProject])

  // Once we have documents list, load first doc or create one
  useEffect(() => {
    if (!projectId || documents === undefined) return
    if (documentId) return

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
        const docId = await createDocumentMut({
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
  }, [projectId, documents, documentId, createDocumentMut])

  // --- Persist: save current state to Convex ---
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

  // --- Document management: switch, create, delete ---
  const switchDocument = useCallback((docId: Id<'documents'>) => {
    if (docId === documentId) return

    // Save current before switching
    persistToConvex()
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    // Find the target doc from the reactive query
    const target = documents?.find(d => d._id === docId)
    if (!target) return

    setDocumentId(docId)
    setState(createEditorState({
      id: docId,
      title: target.title,
      components: (target.components ?? []).map(c => ({
        id: c.id,
        definitionId: c.definitionId,
        values: c.values as Record<string, string | number | boolean>,
      })),
    }))
  }, [documentId, documents, persistToConvex])

  const createNewDocument = useCallback(async () => {
    if (!projectId) return

    // Save current first
    persistToConvex()
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    const title = 'Untitled Document'
    const docId = await createDocumentMut({
      projectId,
      title,
      path: `docs/${toSlug(title)}.md`,
      branch: 'main',
    })

    setDocumentId(docId)
    setState(createEditorState({
      id: docId,
      title,
      components: [],
    }))
  }, [projectId, persistToConvex, createDocumentMut])

  const deleteDocument = useCallback(async (docId: Id<'documents'>) => {
    if (!documents || documents.length <= 1) return // don't delete last doc

    await removeDocument({ id: docId })

    // If we deleted the active doc, switch to another
    if (docId === documentId) {
      const remaining = documents.filter(d => d._id !== docId)
      if (remaining.length > 0) {
        const next = remaining[0]
        setDocumentId(next._id)
        setState(createEditorState({
          id: next._id,
          title: next.title,
          components: (next.components ?? []).map(c => ({
            id: c.id,
            definitionId: c.definitionId,
            values: c.values as Record<string, string | number | boolean>,
          })),
        }))
      }
    }
  }, [documents, documentId, removeDocument])

  // --- ViewModel + palette ---
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

  // --- Commands ---
  const handleAddComponent = useCallback((def: ComponentDefinition) => {
    setState(s => addComponent(s, def))
    scheduleSave()
  }, [scheduleSave])

  const handleInsertComponentAt = useCallback((def: ComponentDefinition, index: number) => {
    setState(s => insertComponentAt(s, def, index))
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
    persistToConvex()
    // TODO: GitHub API commit
    console.log('Publishing...', previewHtml)
  }, [persistToConvex, previewHtml])

  return {
    // State
    document: state.document,
    documentId,
    documents: documents ?? [],
    selectedComponent,
    selectedDefinition,
    isDirty: state.isDirty,
    isLoading,
    previewHtml,
    palette,

    // Document management
    switchDocument,
    createNewDocument,
    deleteDocument,

    // Editor commands
    addComponent: handleAddComponent,
    insertComponentAt: handleInsertComponentAt,
    updateProperty: handleUpdateProperty,
    removeComponent: handleRemoveComponent,
    selectComponent: handleSelectComponent,
    setTitle: handleSetTitle,
    publish: handlePublish,
  }
}
