import type { ComponentDefinition, ComponentInstance } from '../../models/types'

interface Props {
  title: string
  instances: ComponentInstance[]
  definitions: ComponentDefinition[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRemove: (id: string) => void
}

function getBlockSummary(instance: ComponentInstance, def: ComponentDefinition | undefined): string {
  if (!def) return instance.definitionId

  if (instance.definitionId === 'text-block') {
    const content = String(instance.values.content ?? '')
    return content.slice(0, 120) || 'Empty text block'
  }
  if (instance.definitionId === 'entity-schema') {
    return String(instance.values.name ?? 'Unnamed entity')
  }
  if (instance.definitionId === 'api-endpoint') {
    const method = instance.values.method ?? ''
    const path = instance.values.path ?? ''
    return method && path ? `${method} ${path}` : 'Unnamed endpoint'
  }
  if (instance.definitionId === 'sequence-diagram') {
    return String(instance.values.title ?? 'Unnamed diagram')
  }

  return def.name
}

export function DocumentCanvas({ instances, definitions, selectedId, onSelect, onRemove }: Props) {
  if (instances.length === 0) {
    return (
      <div className="canvas-area">
        <div className="document-canvas">
          <div className="empty-canvas">
            <p>Start writing your document</p>
            <span className="hint">Add components from the sidebar to build your page</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="canvas-area">
      <div className="document-canvas">
        <div className="block-list">
          {instances.map(inst => {
            const def = definitions.find(d => d.id === inst.definitionId)
            const isSelected = inst.id === selectedId
            return (
              <div
                key={inst.id}
                className={`component-block ${isSelected ? 'selected' : ''}`}
                data-type={inst.definitionId}
                onClick={() => onSelect(isSelected ? null : inst.id)}
              >
                <div className="block-header">
                  <span className="block-type">
                    <span
                      className="type-dot"
                      data-type={inst.definitionId}
                      style={{
                        background:
                          inst.definitionId === 'entity-schema' ? 'var(--type-schema)' :
                          inst.definitionId === 'api-endpoint' ? 'var(--type-api)' :
                          inst.definitionId === 'sequence-diagram' ? 'var(--type-diagram)' :
                          'var(--type-text)'
                      }}
                    />
                    {def?.name}
                  </span>
                  <button
                    className="block-remove"
                    onClick={e => { e.stopPropagation(); onRemove(inst.id) }}
                    aria-label="Remove block"
                  >
                    &times;
                  </button>
                </div>
                <div className="block-summary">
                  {getBlockSummary(inst, def)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
