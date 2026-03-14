import { useEffect } from 'react'
import type { ComponentDefinition, ComponentField, ComponentInstance } from '../../models/types'

interface Props {
  instance: ComponentInstance
  definition: ComponentDefinition
  fields: ComponentField[]
  onUpdate: (instanceId: string, key: string, value: string | number | boolean) => void
  onRemove: (instanceId: string) => void
  onClose: () => void
}

export function PropertyEditor({ instance, definition, fields, onUpdate, onRemove, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        ;(e.target as HTMLElement).blur()
        return
      }
      onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      <div className="property-panel-backdrop" onClick={onClose} />
      <div className="property-panel">
        <div className="property-panel-drag" onClick={onClose} aria-label="Close panel">
          <div className="property-panel-drag-bar" />
        </div>
        <div className="property-panel-header">
          <span className="property-panel-title">{definition.name}</span>
          <button className="property-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {fields.map(field => (
          <div key={field.key} className="field">
            <label htmlFor={`field-${field.key}`}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={`field-${field.key}`}
                value={String(instance.values[field.key] ?? '')}
                onChange={e => onUpdate(instance.id, field.key, e.target.value)}
                rows={4}
              />
            ) : field.type === 'select' ? (
              <select
                id={`field-${field.key}`}
                value={String(instance.values[field.key] ?? '')}
                onChange={e => onUpdate(instance.id, field.key, e.target.value)}
              >
                <option value="">Choose one...</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={`field-${field.key}`}
                type={field.type === 'number' ? 'number' : 'text'}
                value={String(instance.values[field.key] ?? '')}
                onChange={e => onUpdate(instance.id, field.key, e.target.value)}
              />
            )}
          </div>
        ))}

        <button className="remove-block-btn" onClick={() => onRemove(instance.id)}>
          Remove from page
        </button>
      </div>
    </>
  )
}
