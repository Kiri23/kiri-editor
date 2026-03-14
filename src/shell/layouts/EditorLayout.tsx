import { useState } from 'react'
import { FileTree } from '../components/FileTree'
import { ComponentPalette } from '../components/ComponentPalette'
import { DocumentCanvas } from '../components/DocumentCanvas'
import { PropertyEditor } from '../components/PropertyEditor'
import { useDocEditor } from '../../hooks/useDocEditor'

export function EditorLayout() {
  const editor = useDocEditor()
  const [showFileTree, setShowFileTree] = useState(false)

  if (editor.isLoading) {
    return (
      <div className="editor-layout">
        <div className="canvas-area">
          <div className="document-canvas">
            <div className="empty-canvas">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="editor-layout">
      <header className="editor-header">
        <div className="header-left">
          <button
            className="files-toggle"
            onClick={() => setShowFileTree(!showFileTree)}
            aria-label="Toggle file tree"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="logo">Kiri</span>
        </div>
        <input
          className="doc-title"
          value={editor.document.title}
          onChange={e => editor.setTitle(e.target.value)}
          placeholder="Untitled"
        />
        <div className="header-actions">
          {editor.isDirty && <span className="dirty-indicator">Draft</span>}
          <button className="publish-btn" onClick={editor.publish}>
            Publish
          </button>
        </div>
      </header>

      <div className="editor-body">
        <div className={`file-tree-container ${showFileTree ? 'open' : ''}`}>
          <FileTree
            documents={editor.documents}
            activeId={editor.documentId}
            onSelect={(id) => { editor.switchDocument(id); setShowFileTree(false) }}
            onCreate={editor.createNewDocument}
            onDelete={editor.deleteDocument}
          />
        </div>

        {showFileTree && (
          <div className="file-tree-backdrop" onClick={() => setShowFileTree(false)} />
        )}

        <ComponentPalette
          components={editor.palette}
          onAdd={editor.addComponent}
        />

        <DocumentCanvas
          title={editor.document.title}
          instances={editor.document.components}
          definitions={editor.palette}
          selectedId={editor.selectedComponent?.id ?? null}
          onSelect={editor.selectComponent}
          onRemove={editor.removeComponent}
        />

        {editor.selectedComponent && editor.selectedDefinition && (
          <PropertyEditor
            instance={editor.selectedComponent}
            definition={editor.selectedDefinition}
            fields={editor.selectedDefinition.fields}
            onUpdate={editor.updateProperty}
            onRemove={editor.removeComponent}
            onClose={() => editor.selectComponent(null)}
          />
        )}
      </div>
    </div>
  )
}
