/**
 * UI Shell — Array Sub-Editor
 * Renders array fields as a list of item cards with add/remove.
 * Each item shows sub-fields as regular inputs.
 */

import type { ComponentField } from '../../models/types'

interface Props {
  value: unknown[]
  schema: ComponentField[]
  onUpdate: (newArray: unknown[]) => void
}

export function ArrayEditor({ value, schema, onUpdate }: Props) {
  const items = Array.isArray(value) ? value : []

  const addItem = () => {
    const newItem: Record<string, unknown> = {}
    for (const field of schema) {
      if (field.default !== undefined) newItem[field.key] = field.default
    }
    onUpdate([...items, newItem])
  }

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, key: string, val: unknown) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      return { ...(item as Record<string, unknown>), [key]: val }
    })
    onUpdate(updated)
  }

  return (
    <div className="array-editor">
      {items.map((item, index) => {
        const record = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>
        return (
          <div key={index} className="array-item">
            <div className="array-item-fields">
              {schema.map(field => (
                <div key={field.key} className="array-item-field">
                  <label>{field.label}</label>
                  {field.type === 'boolean' ? (
                    <label className="array-checkbox">
                      <input
                        type="checkbox"
                        checked={Boolean(record[field.key])}
                        onChange={e => updateItem(index, field.key, e.target.checked)}
                      />
                      <span>{field.label}</span>
                    </label>
                  ) : field.enum ? (
                    <select
                      value={String(record[field.key] ?? '')}
                      onChange={e => updateItem(index, field.key, e.target.value)}
                    >
                      <option value="">Choose...</option>
                      {field.enum.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.widget === 'textarea' ? (
                    <textarea
                      value={String(record[field.key] ?? '')}
                      onChange={e => updateItem(index, field.key, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={String(record[field.key] ?? '')}
                      onChange={e => updateItem(index, field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}
            </div>
            <button className="array-item-remove" onClick={() => removeItem(index)} aria-label="Remove item">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )
      })}
      <button className="array-add-btn" onClick={addItem}>+ Add</button>
    </div>
  )
}
