/**
 * UI Shell — Component Palette
 * Shows available components to drag/add to the document.
 */

import type { ComponentDefinition } from '../../models/types'

interface Props {
  components: ComponentDefinition[]
  onAdd: (def: ComponentDefinition) => void
}

export function ComponentPalette({ components, onAdd }: Props) {
  return (
    <div className="palette">
      <h3>Components</h3>
      <ul>
        {components.map(def => (
          <li key={def.id}>
            <button onClick={() => onAdd(def)} title={def.description}>
              <span className="icon">{def.icon}</span>
              <span>{def.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
