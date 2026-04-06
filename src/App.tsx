import { useState, useEffect } from 'react'
import { EditorLayout } from './shell/layouts/EditorLayout'
import { WorkspaceSelector } from './shell/components/WorkspaceSelector'
import './App.css'

interface Workspace {
  owner: string
  repo: string
}

function App() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)

  // Check URL hash for GitHub OAuth callback
  useEffect(() => {
    if (window.location.hash === '#/github-connected') {
      window.location.hash = '#/'
    }
  }, [])

  // Restore last workspace from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kiri-workspace')
    if (saved) {
      try { setWorkspace(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

  const handleSelectWorkspace = (owner: string, repo: string) => {
    const ws = { owner, repo }
    setWorkspace(ws)
    localStorage.setItem('kiri-workspace', JSON.stringify(ws))
  }

  if (!workspace) {
    return <WorkspaceSelector onSelect={handleSelectWorkspace} />
  }

  return (
    <EditorLayout
      workspace={workspace}
      onBack={() => { setWorkspace(null); localStorage.removeItem('kiri-workspace') }}
    />
  )
}

export default App
