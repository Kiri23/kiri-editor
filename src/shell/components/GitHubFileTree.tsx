/**
 * GitHub File Tree — reads docs/ structure from a GitHub repo
 * Shows folders as collapsible sections, .md files as selectable items
 */

import { useCallback, useEffect, useState } from 'react'
import { useGitHub } from '../../hooks/useGitHub'

interface TreeNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: TreeNode[]
  isOpen?: boolean
  isLoading?: boolean
}

interface Props {
  owner: string
  repo: string
  activePath: string | null
  onSelect: (path: string) => void
}

export function GitHubFileTree({ owner, repo, activePath, onSelect }: Props) {
  const github = useGitHub()
  const [tree, setTree] = useState<TreeNode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load root docs/ directory
  useEffect(() => {
    if (!github.isConnected) return
    setIsLoading(true)
    github.getTree(owner, repo, 'docs').then(items => {
      setTree(items.map((item: { name: string; path: string; type: string }) => ({
        name: item.name,
        path: item.path,
        type: item.type as 'file' | 'dir',
        children: item.type === 'dir' ? [] : undefined,
        isOpen: false,
      })))
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [github.isConnected, owner, repo])

  const toggleFolder = useCallback(async (node: TreeNode) => {
    if (node.type !== 'dir') return

    if (node.isOpen) {
      // Close
      setTree(prev => updateNode(prev, node.path, { isOpen: false }))
      return
    }

    // Open and load children if empty
    if (!node.children || node.children.length === 0) {
      setTree(prev => updateNode(prev, node.path, { isLoading: true, isOpen: true }))
      const items = await github.getTree(owner, repo, node.path)
      const children = items.map((item: { name: string; path: string; type: string }) => ({
        name: item.name,
        path: item.path,
        type: item.type as 'file' | 'dir',
        children: item.type === 'dir' ? [] : undefined,
        isOpen: false,
      }))
      setTree(prev => updateNode(prev, node.path, { children, isLoading: false, isOpen: true }))
    } else {
      setTree(prev => updateNode(prev, node.path, { isOpen: true }))
    }
  }, [github, owner, repo])

  if (isLoading) {
    return (
      <nav className="file-tree">
        <div className="file-tree-header">
          <span className="file-tree-label">Loading...</span>
        </div>
      </nav>
    )
  }

  return (
    <nav className="file-tree">
      <div className="file-tree-header">
        <span className="file-tree-label">docs/</span>
      </div>
      <ul className="file-tree-list">
        {tree.map(node => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            activePath={activePath}
            onSelect={onSelect}
            onToggle={toggleFolder}
          />
        ))}
      </ul>
    </nav>
  )
}

function TreeItem({ node, depth, activePath, onSelect, onToggle }: {
  node: TreeNode
  depth: number
  activePath: string | null
  onSelect: (path: string) => void
  onToggle: (node: TreeNode) => void
}) {
  const isActive = node.path === activePath
  const isMd = node.name.endsWith('.md')
  const isDir = node.type === 'dir'
  const indent = depth * 16

  if (isDir) {
    return (
      <>
        <li className="file-tree-item" style={{ paddingLeft: indent }}>
          <button className="file-tree-select" onClick={() => onToggle(node)}>
            <span className="file-tree-icon">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                style={{ transform: node.isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="file-tree-name">{node.name}</span>
          </button>
        </li>
        {node.isOpen && node.children?.map(child => (
          <TreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            activePath={activePath}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
        {node.isOpen && node.isLoading && (
          <li className="file-tree-item" style={{ paddingLeft: indent + 16 }}>
            <span className="file-tree-name" style={{ color: 'var(--ink-muted)' }}>Loading...</span>
          </li>
        )}
      </>
    )
  }

  if (!isMd) return null // Only show .md files

  return (
    <li className={`file-tree-item ${isActive ? 'active' : ''}`} style={{ paddingLeft: indent }}>
      <button className="file-tree-select" onClick={() => onSelect(node.path)}>
        <span className="file-tree-icon">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 1h5.5L13 4.5V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M9.5 1v3.5H13" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </span>
        <span className="file-tree-name">{node.name.replace('.md', '')}</span>
      </button>
    </li>
  )
}

// Helper to update a node in a nested tree by path
function updateNode(nodes: TreeNode[], path: string, updates: Partial<TreeNode>): TreeNode[] {
  return nodes.map(node => {
    if (node.path === path) return { ...node, ...updates }
    if (node.children) return { ...node, children: updateNode(node.children, path, updates) }
    return node
  })
}
