/**
 * Product API client — talks to the Service Worker's virtual routes.
 * Generic: doesn't know which product is behind the API.
 */

import type { ComponentDefinition } from '../models/types'

export async function fetchComponents(): Promise<ComponentDefinition[]> {
  try {
    const res = await fetch('/api/components')
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function renderMarkdown(markdown: string): Promise<string> {
  try {
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown }),
    })
    if (!res.ok) return '<p>Render failed</p>'
    const { html } = await res.json()
    return html
  } catch {
    return '<p>Render unavailable</p>'
  }
}

export interface ProductManifest {
  product: string
  version: string
  previewStyles: string[]
  tailwind: boolean
}

export async function fetchManifest(): Promise<ProductManifest | null> {
  try {
    const res = await fetch('/api/manifest')
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
