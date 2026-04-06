/**
 * Workspace Selector — Connect GitHub, pick a repo to edit
 */

import { useEffect } from 'react'
import { useGitHub } from '../../hooks/useGitHub'

interface Props {
  onSelect: (owner: string, repo: string) => void
}

export function WorkspaceSelector({ onSelect }: Props) {
  const github = useGitHub()

  useEffect(() => {
    if (github.isConnected && github.repos.length === 0) {
      github.loadRepos()
    }
  }, [github.isConnected])

  if (!github.isConnected) {
    return (
      <div className="workspace-selector">
        <div className="workspace-hero">
          <h1 className="workspace-title">Kiri Editor</h1>
          <p className="workspace-subtitle">Connect your GitHub to start editing documentation</p>
          <button className="github-connect-btn" onClick={github.connect}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Connect GitHub
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="workspace-selector">
      <div className="workspace-header">
        <div className="workspace-user">
          {github.avatarUrl && <img src={github.avatarUrl} className="workspace-avatar" alt="" />}
          <span className="workspace-username">{github.username}</span>
        </div>
        <button className="workspace-disconnect" onClick={github.disconnect}>Disconnect</button>
      </div>

      <h2 className="workspace-heading">Select a repository</h2>

      {github.isLoadingRepos ? (
        <p className="workspace-loading">Loading repositories...</p>
      ) : (
        <div className="workspace-repo-list">
          {github.repos.map(repo => (
            <button
              key={repo.fullName}
              className="workspace-repo-card"
              onClick={() => onSelect(repo.owner, repo.name)}
            >
              <div className="workspace-repo-name">
                {repo.private && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="workspace-repo-lock">
                    <path d="M4 6V4a4 4 0 118 0v2h1a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1h1zm2-2a2 2 0 114 0v2H6V4z"/>
                  </svg>
                )}
                {repo.name}
              </div>
              {repo.description && (
                <p className="workspace-repo-desc">{repo.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
