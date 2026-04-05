/**
 * Doc Editor — Component definitions for DocsifyTemplate
 * Each definition maps to a YAML code fence type.
 *
 * User-facing names and labels should avoid technical jargon.
 * YAML is an internal format — never expose it in labels.
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
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'fields', label: 'Properties', type: 'textarea', required: true },
    ],
  },
  {
    id: 'api-endpoint',
    name: 'API Endpoint',
    description: 'Document how to call a specific URL',
    icon: '🔌',
    fields: [
      { key: 'method', label: 'Method', type: 'select', required: true, options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'path', label: 'URL path', type: 'text', required: true },
      { key: 'description', label: 'What it does', type: 'textarea' },
      { key: 'request', label: 'Request body', type: 'textarea' },
      { key: 'response', label: 'Response example', type: 'textarea' },
    ],
  },
  {
    id: 'sequence-diagram',
    name: 'Flow Diagram',
    description: 'Show the steps in a process between people or systems',
    icon: '📊',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'actors', label: 'Participants', type: 'text', required: true },
      { key: 'steps', label: 'Steps', type: 'textarea', required: true },
    ],
  },
  {
    id: 'text-block',
    name: 'Text',
    description: 'Write a section of content',
    icon: '📝',
    fields: [
      { key: 'heading', label: 'Section heading', type: 'text' },
      { key: 'content', label: 'Content', type: 'textarea', required: true },
    ],
  },
]
