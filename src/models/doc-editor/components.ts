/**
 * Doc Editor — Component definitions for DocsifyTemplate
 * Each definition maps to a YAML code fence type.
 */

import type { ComponentDefinition } from '../types'

export const docComponents: ComponentDefinition[] = [
  {
    id: 'entity-schema',
    name: 'Entity Schema',
    description: 'Define a data entity with its fields and types',
    icon: '🗂️',
    fields: [
      { key: 'name', label: 'Entity Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'fields', label: 'Fields (YAML)', type: 'textarea', required: true },
    ],
  },
  {
    id: 'api-endpoint',
    name: 'API Endpoint',
    description: 'Document a REST API endpoint',
    icon: '🔌',
    fields: [
      { key: 'method', label: 'HTTP Method', type: 'select', required: true, options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'path', label: 'Path', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'request', label: 'Request Body (YAML)', type: 'textarea' },
      { key: 'response', label: 'Response (YAML)', type: 'textarea' },
    ],
  },
  {
    id: 'sequence-diagram',
    name: 'Sequence Diagram',
    description: 'Visualize a flow between actors',
    icon: '📊',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'actors', label: 'Actors (comma-separated)', type: 'text', required: true },
      { key: 'steps', label: 'Steps (YAML)', type: 'textarea', required: true },
    ],
  },
  {
    id: 'text-block',
    name: 'Text Block',
    description: 'Rich text content section',
    icon: '📝',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'content', label: 'Content (Markdown)', type: 'textarea', required: true },
    ],
  },
]
