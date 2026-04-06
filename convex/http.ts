import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { api } from './_generated/api'

const http = httpRouter()

// GitHub OAuth callback — GitHub redirects here with ?code=XXX
http.route({
  path: '/github/callback',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return new Response('Missing code parameter', { status: 400 })
    }

    try {
      await ctx.runAction(api.github.exchangeCode, { code })

      // Redirect back to the app
      const appUrl = process.env.APP_URL ?? 'http://localhost:5173'
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/#/github-connected` },
      })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      return new Response(`OAuth failed: ${message}`, { status: 500 })
    }
  }),
})

export default http
