import { useState } from 'react'
import type { ComponentDefinition } from '../../models/types'

interface Props {
  components: ComponentDefinition[]
  onAdd: (def: ComponentDefinition) => void
}

const TYPE_COLORS: Record<string, string> = {
  'entity-schema': 'var(--type-schema)',
  'api-endpoint': 'var(--type-api)',
  'sequence-diagram': 'var(--type-diagram)',
  'text-block': 'var(--type-text)',
}

export function ComponentPalette({ components, onAdd }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && <div className="fab-backdrop" onClick={() => setOpen(false)} />}
      <div className="fab-container">
        {open && (
          <div className="fab-palette">
            <div className="fab-palette-label">Add block</div>
            {components.map(def => (
              <button
                key={def.id}
                className="fab-palette-item"
                onClick={() => { onAdd(def); setOpen(false) }}
              >
                <span
                  className="fab-palette-dot"
                  style={{ background: TYPE_COLORS[def.id] ?? 'var(--type-text)' }}
                />
                <div className="fab-palette-text">
                  <span className="fab-palette-name">{def.name}</span>
                  <span className="fab-palette-desc">{def.description}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        <button
          className={`fab ${open ? 'fab-open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close palette' : 'Add block'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </>
  )
}
