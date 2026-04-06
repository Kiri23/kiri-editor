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

/* eslint-disable @typescript-eslint/no-explicit-any */

export const exchangeCode = action({
  args: { code: v.string() },
  handler: async (ctx, args): Promise<{ username: string; avatarUrl: string }> => {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth not configured')
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code: args.code }),
    })
    const tokenData: any = await tokenRes.json()

    if (tokenData.error) {
      throw new Error(`GitHub OAuth error: ${tokenData.error_description ?? tokenData.error}`)
    }

    const accessToken: string = tokenData.access_token

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const userData: any = await userRes.json()

    await ctx.runMutation(api.github.saveToken, {
      userId: 'local-user',
      accessToken,
      username: userData.login,
      avatarUrl: userData.avatar_url,
    })

    return { username: userData.login, avatarUrl: userData.avatar_url }
  },
})

export const listRepos = action({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<Array<{ owner: string; name: string; fullName: string; description: string; private: boolean; updatedAt: string }>> => {
    const token = await ctx.runQuery(api.github.getToken, { userId: args.userId })
    if (!token) throw new Error('GitHub not connected')

    const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    })
    const repos: any[] = await res.json()

    return repos.map((r: any) => ({
      owner: r.owner?.login ?? '',
      name: r.name ?? '',
      fullName: r.full_name ?? '',
      description: r.description ?? '',
      private: !!r.private,
      updatedAt: r.updated_at ?? '',
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
  handler: async (ctx, args): Promise<Array<{ name: string; path: string; type: string; sha: string }>> => {
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

    const items: any = await res.json()
    if (!Array.isArray(items)) return []

    return items.map((item: any) => ({
      name: item.name ?? '',
      path: item.path ?? '',
      type: item.type ?? 'file',
      sha: item.sha ?? '',
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
  handler: async (ctx, args): Promise<{ content: string; sha: string; path: string }> => {
    const token = await ctx.runQuery(api.github.getToken, { userId: args.userId })
    if (!token) throw new Error('GitHub not connected')

    const res = await fetch(
      `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${args.path}`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    )

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)

    const data: any = await res.json()
    const content: string = atob((data.content as string).replace(/\n/g, ''))
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
    sha: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ sha: string; url: string }> => {
    const token = await ctx.runQuery(api.github.getToken, { userId: args.userId })
    if (!token) throw new Error('GitHub not connected')

    const body: Record<string, unknown> = {
      message: args.message,
      content: btoa(args.content),
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
      const err: any = await res.json()
      throw new Error(`GitHub commit failed: ${err.message}`)
    }

    const result: any = await res.json()
    return { sha: result.content.sha, url: result.content.html_url }
  },
})
