import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Project metadata — which repo, what product type
  projects: defineTable({
    name: v.string(),
    productType: v.string(), // 'doc-editor' | 'resume-builder' | 'blog-editor'
    repoOwner: v.string(),
    repoName: v.string(),
    createdBy: v.string(),
  }).index('by_createdBy', ['createdBy']),

  // Document metadata (content lives in GitHub)
  documents: defineTable({
    projectId: v.id('projects'),
    title: v.string(),
    path: v.string(), // GitHub file path
    branch: v.string(),
    lastEditedBy: v.string(),
    updatedAt: v.number(),
  }).index('by_project', ['projectId']),
})
