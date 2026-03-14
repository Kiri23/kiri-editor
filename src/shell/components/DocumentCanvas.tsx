import { useState } from 'react'
import type { ComponentDefinition, ComponentInstance } from '../../models/types'
import { getBlockDisplay, getMethodColor } from '../../models/doc-editor/block-display'

interface Props {
  title: string
  instances: ComponentInstance[]
  definitions: ComponentDefinition[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRemove: (id: string) => void
  onAdd?: (def: ComponentDefinition) => void
  onInsertAt?: (def: ComponentDefinition, index: number) => void
}

function BlockIcon({ path, color }: { path: string; color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Renders block body based on layout variant from config */
function BlockBody({ instance }: { instance: ComponentInstance }) {
  const config = getBlockDisplay(instance.definitionId)

  if (config.layout === 'badge') {
    const badge = config.badge?.(instance.values)
    const summary = config.summary(instance.values)
    return (
      <div className="block-body block-body--badge">
        {badge && (
          <span
            className="block-badge"
            style={{ background: getMethodColor(badge) }}
          >
            {badge}
          </span>
        )}
        <span className="block-path">{summary}</span>
      </div>
    )
  }

  if (config.layout === 'entity') {
    const summary = config.summary(instance.values)
    const countInfo = config.count?.(instance.values)
    return (
      <div className="block-body block-body--entity">
        <span className="block-entity-name">{summary}</span>
        {countInfo && countInfo.n > 0 && (
          <span className="block-count">
            {countInfo.n} {countInfo.label}
          </span>
        )}
      </div>
    )
  }

  if (config.layout === 'diagram') {
    const summary = config.summary(instance.values)
    const pills = config.pills?.(instance.values) ?? []
    return (
      <div className="block-body block-body--diagram">
        <span className="block-diagram-title">{summary}</span>
        {pills.length > 0 && (
          <div className="block-pills">
            {pills.map((p, i) => (
              <span key={i} className="block-pill">{p}</span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // prose (default)
  const summary = config.summary(instance.values)
  return (
    <div className="block-body block-body--prose">
      <span className="block-prose">{summary}</span>
    </div>
  )
}

function InsertGap({
  index,
  definitions,
  onInsert,
}: {
  index: number
  definitions: ComponentDefinition[]
  onInsert: (def: ComponentDefinition, index: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="block-gap">
      <div className="insert-line">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setOpen(!open)
          }}
          aria-label="Insert block here"
        >
          +
        </button>
      </div>
      {open && (
        <div className="insert-palette">
          {definitions.map(def => {
            const dc = getBlockDisplay(def.id)
            return (
              <button
                key={def.id}
                className="insert-palette-item"
                onClick={(e) => {
                  e.stopPropagation()
                  onInsert(def, index)
                  setOpen(false)
                }}
                title={def.description}
              >
                <span
                  className="insert-palette-dot"
                  style={{ background: dc.color }}
                />
                <span>{def.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyCanvas({ definitions, onAdd }: { definitions: ComponentDefinition[], onAdd?: (def: ComponentDefinition) => void }) {
  const textBlock = definitions.find(d => d.id === 'text-block')

  return (
    <div className="canvas-area">
      <div className="document-canvas">
        <div className="empty-canvas">
          <div className="empty-hero">
            <div className="empty-page-icon">
              <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
                <path d="M4 2h20l12 12v30a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M24 2v12h12" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="10" y1="22" x2="30" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                <line x1="10" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                <rect x="10" y="33" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
              </svg>
            </div>
            <h2 className="empty-title">Your page is ready</h2>
            <p className="empty-subtitle">Build your docs by adding blocks — text, data models, endpoints, and more</p>
          </div>

          <div className="empty-steps">
            <div className="empty-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <span className="step-label">Add a block</span>
                <span className="step-desc">tap the + button</span>
              </div>
            </div>
            <div className="empty-step-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="empty-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <span className="step-label">Edit details</span>
                <span className="step-desc">tap to open</span>
              </div>
            </div>
            <div className="empty-step-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="empty-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <span className="step-label">Publish</span>
                <span className="step-desc">one click</span>
              </div>
            </div>
          </div>

          {/* Ghost preview — what a finished block looks like */}
          <div className="empty-preview">
            <div className="ghost-block" data-type="api-endpoint">
              <div className="ghost-header">
                <span className="ghost-badge" style={{ background: 'var(--success)' }}>GET</span>
                <span className="ghost-summary">/api/users</span>
              </div>
            </div>
            <div className="ghost-block" data-type="entity-schema">
              <div className="ghost-header">
                <span className="ghost-dot" style={{ background: 'var(--type-schema)' }} />
                <span className="ghost-type">Data Model</span>
              </div>
              <span className="ghost-summary">User</span>
            </div>
          </div>

          {textBlock && onAdd && (
            <button className="empty-cta" onClick={() => onAdd(textBlock)}>
              Add your first block
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function DocumentCanvas({ instances, definitions, selectedId, onSelect, onRemove, onAdd, onInsertAt }: Props) {
  if (instances.length === 0) {
    return <EmptyCanvas definitions={definitions} onAdd={onAdd} />
  }

  const handleInsert = onInsertAt ?? ((def: ComponentDefinition, _index: number) => onAdd?.(def))

  return (
    <div className="canvas-area">
      <div className="document-canvas">
        <div className="block-list">
          {/* Insert gap before first block */}
          <InsertGap index={0} definitions={definitions} onInsert={handleInsert} />

          {instances.map((inst, i) => {
            const def = definitions.find(d => d.id === inst.definitionId)
            const config = getBlockDisplay(inst.definitionId)
            const isSelected = inst.id === selectedId
            return (
              <div key={inst.id}>
                <div
                  className={`component-block ${isSelected ? 'selected' : ''}`}
                  data-type={inst.definitionId}
                  onClick={() => onSelect(isSelected ? null : inst.id)}
                >
                  <div className="block-header">
                    <span className="block-type">
                      <BlockIcon path={config.icon} color={config.color} />
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
                  <BlockBody instance={inst} />
                </div>
                {/* Insert gap after each block */}
                <InsertGap index={i + 1} definitions={definitions} onInsert={handleInsert} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
