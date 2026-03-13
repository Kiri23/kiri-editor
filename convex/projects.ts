import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('projects').collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    productType: v.string(),
    repoOwner: v.string(),
    repoName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('projects', {
      ...args,
      createdBy: 'local-user', // TODO: replace with Clerk auth
    })
  },
})
