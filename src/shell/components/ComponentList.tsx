/**
 * UI Shell — Component List
 * Shows instances added to the document.
 */

import type { ComponentDefinition, ComponentInstance } from '../../models/types'

interface Props {
  instances: ComponentInstance[]
  definitions: ComponentDefinition[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function ComponentList({ instances, definitions, selectedId, onSelect }: Props) {
  if (instances.length === 0) {
    return (
      <div className="component-list empty">
        <p>No components yet. Add one from the palette.</p>
      </div>
    )
  }

  return (
    <div className="component-list">
      <h3>Document</h3>
      <ul>
        {instances.map(inst => {
          const def = definitions.find(d => d.id === inst.definitionId)
          return (
            <li
              key={inst.id}
              className={inst.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(inst.id === selectedId ? null : inst.id)}
            >
              <span className="icon">{def?.icon ?? '?'}</span>
              <span>{def?.name ?? inst.definitionId}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
