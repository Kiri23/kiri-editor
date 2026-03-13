/**
 * UI Shell — Property Editor
 * Shows fields for the selected component instance.
 */

import type { ComponentField, ComponentInstance } from '../../models/types'

interface Props {
  instance: ComponentInstance
  fields: ComponentField[]
  onUpdate: (instanceId: string, key: string, value: string | number | boolean) => void
  onRemove: (instanceId: string) => void
}

export function PropertyEditor({ instance, fields, onUpdate, onRemove }: Props) {
  return (
    <div className="property-editor">
      <div className="property-header">
        <h3>Properties</h3>
        <button className="remove-btn" onClick={() => onRemove(instance.id)}>
          Remove
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
              <option value="">Select...</option>
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
    </div>
  )
}
