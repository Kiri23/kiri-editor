/**
 * GitHub integration hook — OAuth flow + API calls via Convex actions
 */

import { useQuery, useAction, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCallback, useState } from 'react'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string
const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL as string
const USER_ID = 'local-user'

export function useGitHub() {
  const token = useQuery(api.github.getToken, { userId: USER_ID })
  const removeTokenMut = useMutation(api.github.removeToken)
  const listReposAction = useAction(api.github.listRepos)
  const getRepoTreeAction = useAction(api.github.getRepoTree)
  const getFileContentAction = useAction(api.github.getFileContent)
  const commitFileAction = useAction(api.github.commitFile)

  const [repos, setRepos] = useState<Array<{
    owner: string
    name: string
    fullName: string
    description: string
    private: boolean
  }>>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)

  const isConnected = !!token?.accessToken
  const username = token?.username ?? null
  const avatarUrl = token?.avatarUrl ?? null

  const connect = useCallback(() => {
    const redirectUri = `${CONVEX_SITE_URL}/github/callback`
    const scope = 'repo'
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`
    window.location.href = url
  }, [])

  const disconnect = useCallback(async () => {
    await removeTokenMut({ userId: USER_ID })
    setRepos([])
  }, [removeTokenMut])

  const loadRepos = useCallback(async () => {
    setIsLoadingRepos(true)
    try {
      const result = await listReposAction({ userId: USER_ID })
      setRepos(result)
    } finally {
      setIsLoadingRepos(false)
    }
  }, [listReposAction])

  const getTree = useCallback(async (owner: string, repo: string, path?: string) => {
    return await getRepoTreeAction({ userId: USER_ID, owner, repo, path })
  }, [getRepoTreeAction])

  const getFile = useCallback(async (owner: string, repo: string, path: string) => {
    return await getFileContentAction({ userId: USER_ID, owner, repo, path })
  }, [getFileContentAction])

  const commitFile = useCallback(async (
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
  ) => {
    return await commitFileAction({ userId: USER_ID, owner, repo, path, content, message, sha })
  }, [commitFileAction])

  return {
    isConnected,
    username,
    avatarUrl,
    connect,
    disconnect,
    repos,
    isLoadingRepos,
    loadRepos,
    getTree,
    getFile,
    commitFile,
  }
}
