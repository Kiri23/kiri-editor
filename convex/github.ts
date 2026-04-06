import { v } from 'convex/values'
import { action, mutation, query } from './_generated/server'
import { api } from './_generated/api'

// --- Queries ---

export const getToken = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('githubTokens')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()
  },
})

// --- Mutations ---

export const saveToken = mutation({
  args: {
    userId: v.string(),
    accessToken: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Upsert: delete existing token for this user
    const existing = await ctx.db
      .query('githubTokens')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()
    if (existing) await ctx.db.delete(existing._id)

    return await ctx.db.insert('githubTokens', {
      ...args,
      connectedAt: Date.now(),
    })
  },
})

export const removeToken = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('githubTokens')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()
    if (existing) await ctx.db.delete(existing._id)
  },
})

// --- Actions (server-side, can make external HTTP calls) ---

export const exchangeCode = action({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth not configured — set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET')
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: args.code,
      }),
    })
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      throw new Error(`GitHub OAuth error: ${tokenData.error_description ?? tokenData.error}`)
    }

    const accessToken = tokenData.access_token as string

    // Fetch user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const userData = await userRes.json()

    // Save token in DB
    await ctx.runMutation(api.github.saveToken, {
      userId: 'local-user',
      accessToken,
      username: userData.login,
      avatarUrl: userData.avatar_url,
    })

    return {
      username: userData.login,
      avatarUrl: userData.avatar_url,
    }
  },
})

// --- GitHub API helpers (actions for server-side calls) ---

export const listRepos = action({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const token = await ctx.runQuery(api.github.getToken, { userId: args.userId })
    if (!token) throw new Error('GitHub not connected')

    const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    })
    const repos = await res.json()

    return repos.map((r: Record<string, unknown>) => ({
      owner: (r.owner as Record<string, unknown>)?.login,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      private: r.private,
      updatedAt: r.updated_at,
    }))
  },
})

export const getRepoTree = action({
  args: {
    userId: v.string(),
    owner: v.string(),
    repo: v.string(),
    path: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const token = await ctx.runQuery(api.github.getToken, { userId: args.userId })
    if (!token) throw new Error('GitHub not connected')

    const dirPath = args.path ?? 'docs'
    const res = await fetch(
      `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${dirPath}`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    )

    if (!res.ok) {
      if (res.status === 404) return []
      throw new Error(`GitHub API error: ${res.status}`)
    }

    const items = await res.json()
    if (!Array.isArray(items)) return [] // single file, not directory

    return items.map((item: Record<string, unknown>) => ({
      name: item.name,
      path: item.path,
      type: item.type, // "file" or "dir"
      sha: item.sha,
    }))
  },
})

export const getFileContent = action({
  args: {
    userId: v.string(),
    owner: v.string(),
    repo: v.string(),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    const token = await ctx.runQuery(api.github.getToken, { userId: args.userId })
    if (!token) throw new Error('GitHub not connected')

    const res = await fetch(
      `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${args.path}`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    )

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)

    const data = await res.json()
    // GitHub returns base64-encoded content
    const content = atob(data.content.replace(/\n/g, ''))
    return { content, sha: data.sha, path: data.path }
  },
})

export const commitFile = action({
  args: {
    userId: v.string(),
    owner: v.string(),
    repo: v.string(),
    path: v.string(),
    content: v.string(),
    message: v.string(),
    sha: v.optional(v.string()), // required for updates, omit for new files
  },
  handler: async (ctx, args) => {
    const token = await ctx.runQuery(api.github.getToken, { userId: args.userId })
    if (!token) throw new Error('GitHub not connected')

    const body: Record<string, unknown> = {
      message: args.message,
      content: btoa(args.content), // base64 encode
    }
    if (args.sha) body.sha = args.sha

    const res = await fetch(
      `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${args.path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(`GitHub commit failed: ${err.message}`)
    }

    const result = await res.json()
    return { sha: result.content.sha, url: result.content.html_url }
  },
})
