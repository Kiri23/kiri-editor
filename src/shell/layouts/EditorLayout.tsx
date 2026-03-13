/**
 * UI Shell — Editor Layout
 * Three-panel layout: Palette | Document + Properties | Preview
 * Pure render — all logic comes from the hook.
 */

import { ComponentPalette } from '../components/ComponentPalette'
import { ComponentList } from '../components/ComponentList'
import { PropertyEditor } from '../components/PropertyEditor'
import { Preview } from '../components/Preview'
import { useDocEditor } from '../../hooks/useDocEditor'

export function EditorLayout() {
  const editor = useDocEditor()

  return (
    <div className="editor-layout">
      <header className="editor-header">
        <input
          className="doc-title"
          value={editor.document.title}
          onChange={e => editor.setTitle(e.target.value)}
        />
        <div className="header-actions">
          {editor.isDirty && <span className="dirty-indicator">Unsaved</span>}
          <button className="publish-btn" onClick={editor.publish}>
            Publish
          </button>
        </div>
      </header>

      <div className="editor-body">
        <aside className="left-panel">
          <ComponentPalette
            components={editor.palette}
            onAdd={editor.addComponent}
          />
          <ComponentList
            instances={editor.document.components}
            definitions={editor.palette}
            selectedId={editor.selectedComponent?.id ?? null}
            onSelect={editor.selectComponent}
          />
        </aside>

        <main className="center-panel">
          {editor.selectedComponent && editor.selectedDefinition ? (
            <PropertyEditor
              instance={editor.selectedComponent}
              fields={editor.selectedDefinition.fields}
              onUpdate={editor.updateProperty}
              onRemove={editor.removeComponent}
            />
          ) : (
            <div className="no-selection">
              <p>Select a component to edit its properties</p>
            </div>
          )}
        </main>

        <aside className="right-panel">
          <Preview markdown={editor.previewHtml} />
        </aside>
      </div>
    </div>
  )
}
