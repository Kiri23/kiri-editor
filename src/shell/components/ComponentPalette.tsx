import type { ComponentDefinition } from '../../models/types'

interface Props {
  components: ComponentDefinition[]
  onAdd: (def: ComponentDefinition) => void
}

export function ComponentPalette({ components, onAdd }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Insert Block</div>
        <ul className="palette-items">
          {components.map(def => (
            <li key={def.id}>
              <button
                className="palette-item"
                onClick={() => onAdd(def)}
                title={def.description}
              >
                <span className="type-dot" data-type={def.id} />
                <span>{def.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
