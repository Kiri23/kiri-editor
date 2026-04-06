import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    productType: v.string(),
    repoOwner: v.string(),
    repoName: v.string(),
    createdBy: v.string(),
  }).index('by_createdBy', ['createdBy']),

  documents: defineTable({
    projectId: v.id('projects'),
    title: v.string(),
    path: v.string(),
    branch: v.string(),
    components: v.array(v.object({
      id: v.string(),
      definitionId: v.string(),
      values: v.any(),
    })),
    lastEditedBy: v.string(),
    updatedAt: v.number(),
  }).index('by_project', ['projectId']),

  githubTokens: defineTable({
    userId: v.string(),
    accessToken: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    connectedAt: v.number(),
  }).index('by_userId', ['userId']),
})
