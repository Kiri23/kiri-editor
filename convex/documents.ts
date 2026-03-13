import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

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
      lastEditedBy: 'local-user',
      updatedAt: Date.now(),
    })
  },
})

export const updateTitle = mutation({
  args: {
    id: v.id('documents'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
    })
  },
})
