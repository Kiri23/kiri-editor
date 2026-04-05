/**
 * Doc Editor — Fallback component definitions
 * Used when Product API is unreachable.
 * User-facing names and labels should avoid technical jargon.
 */

import type { ComponentDefinition } from '../types'

/** Fallback components — used when Product API is unreachable */
export const fallbackComponents: ComponentDefinition[] = [
  {
    id: 'entity-schema',
    name: 'Data Model',
    description: 'Describe a thing in your system and its properties',
    icon: '🗂️',
    fields: [
      { key: 'name', label: 'Name', type: 'string', required: true },
      { key: 'description', label: 'Description', type: 'string', widget: 'textarea' },
      { key: 'fields', label: 'Properties', type: 'string', required: true, widget: 'textarea' },
    ],
  },
  {
    id: 'api-endpoint',
    name: 'API Endpoint',
    description: 'Document how to call a specific URL',
    icon: '🔌',
    fields: [
      { key: 'method', label: 'Method', type: 'string', required: true, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'path', label: 'URL path', type: 'string', required: true },
      { key: 'description', label: 'What it does', type: 'string', widget: 'textarea' },
      { key: 'request', label: 'Request body', type: 'string', widget: 'textarea' },
      { key: 'response', label: 'Response example', type: 'string', widget: 'textarea' },
    ],
  },
  {
    id: 'sequence-diagram',
    name: 'Flow Diagram',
    description: 'Show the steps in a process between people or systems',
    icon: '📊',
    fields: [
      { key: 'title', label: 'Title', type: 'string', required: true },
      { key: 'actors', label: 'Participants', type: 'string', required: true },
      { key: 'steps', label: 'Steps', type: 'string', required: true, widget: 'textarea' },
    ],
  },
  {
    id: 'text-block',
    name: 'Text',
    description: 'Write a section of content',
    icon: '📝',
    fields: [
      { key: 'heading', label: 'Section heading', type: 'string' },
      { key: 'content', label: 'Content', type: 'string', required: true, widget: 'textarea' },
    ],
  },
]
