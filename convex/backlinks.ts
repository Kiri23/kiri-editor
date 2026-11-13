import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Live query consumed by DocsifyTemplate viewer.
// Returns a reverse index { target → [sources] } for the given project key.
// Any mutation that touches the `backlinks` table re-fires this query on
// every subscribed client automatically (Convex live queries, WS transport).
export const getIndex = query({
  args: { projectKey: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('backlinks')
      .withIndex('by_project_target', (q) => q.eq('projectKey', args.projectKey))
      .collect()

    const index: Record<string, string[]> = {}
    for (const r of rows) {
      ;(index[r.target] ||= []).push(r.source)
    }
    for (const k of Object.keys(index)) {
      index[k] = [...new Set(index[k])].sort()
    }
    return index
  },
})

// Replace all backlink rows coming FROM a given source doc with a new set of
// targets. Idempotent — call with an empty `targets` array to clear.
export const setForSource = mutation({
  args: {
    projectKey: v.string(),
    source: v.string(),
    targets: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const old = await ctx.db
      .query('backlinks')
      .withIndex('by_project_source', (q) =>
        q.eq('projectKey', args.projectKey).eq('source', args.source),
      )
      .collect()
    for (const r of old) await ctx.db.delete(r._id)

    for (const t of args.targets) {
      if (t === args.source) continue
      await ctx.db.insert('backlinks', {
        projectKey: args.projectKey,
        source: args.source,
        target: t,
      })
    }
  },
})

// Seed helper for the POC — lets you populate the table from the Convex
// dashboard or CLI without wiring documents.update yet. Accepts a full
// forward map { source → [targets] } and rewrites every row for the project.
export const seed = mutation({
  args: {
    projectKey: v.string(),
    forward: v.record(v.string(), v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const old = await ctx.db
      .query('backlinks')
      .withIndex('by_project_target', (q) => q.eq('projectKey', args.projectKey))
      .collect()
    for (const r of old) await ctx.db.delete(r._id)

    for (const [source, targets] of Object.entries(args.forward)) {
      for (const target of targets) {
        if (target === source) continue
        await ctx.db.insert('backlinks', {
          projectKey: args.projectKey,
          source,
          target,
        })
      }
    }
  },
})
