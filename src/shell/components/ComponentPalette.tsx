import { useEffect, useState } from 'react'
import type { ComponentDefinition } from '../../models/types'
import { getBlockDisplay } from '../../models/doc-editor/block-display'

interface Props {
  components: ComponentDefinition[]
  onAdd: (def: ComponentDefinition) => void
}

export function ComponentPalette({ components, onAdd }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

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
                  style={{ background: getBlockDisplay(def.id).color }}
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
