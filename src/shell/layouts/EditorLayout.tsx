import { ComponentPalette } from '../components/ComponentPalette'
import { DocumentCanvas } from '../components/DocumentCanvas'
import { PropertyEditor } from '../components/PropertyEditor'
import { useDocEditor } from '../../hooks/useDocEditor'

export function EditorLayout() {
  const editor = useDocEditor()

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
        <span className="logo">Kiri</span>
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
