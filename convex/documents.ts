import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const componentValidator = v.object({
  id: v.string(),
  definitionId: v.string(),
  values: v.any(),
})

export const list = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('documents')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .collect()
  },
})

export const get = query({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
    projectId: v.id('projects'),
    title: v.string(),
    path: v.string(),
    branch: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('documents', {
      ...args,
      components: [],
      lastEditedBy: 'local-user',
      updatedAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('documents'),
    title: v.optional(v.string()),
    components: v.optional(v.array(componentValidator)),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (fields.title !== undefined) patch.title = fields.title
    if (fields.components !== undefined) patch.components = fields.components
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
