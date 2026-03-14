import type { Id } from '../../../convex/_generated/dataModel'

interface DocEntry {
  _id: Id<'documents'>
  title: string
  updatedAt: number
}

interface Props {
  documents: DocEntry[]
  activeId: Id<'documents'> | null
  onSelect: (id: Id<'documents'>) => void
  onCreate: () => void
  onDelete: (id: Id<'documents'>) => void
}

export function FileTree({ documents, activeId, onSelect, onCreate, onDelete }: Props) {
  return (
    <nav className="file-tree">
      <div className="file-tree-header">
        <span className="file-tree-label">Pages</span>
        <button className="file-tree-add" onClick={onCreate} aria-label="New page">
          +
        </button>
      </div>
      <ul className="file-tree-list">
        {documents.map(doc => (
          <li key={doc._id} className={`file-tree-item ${doc._id === activeId ? 'active' : ''}`}>
            <button
              className="file-tree-select"
              onClick={() => onSelect(doc._id)}
            >
              <span className="file-tree-icon">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 1h5.5L13 4.5V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M9.5 1v3.5H13" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              </span>
              <span className="file-tree-name">{doc.title || 'Untitled'}</span>
            </button>
            {documents.length > 1 && (
              <button
                className="file-tree-delete"
                onClick={() => {
                  if (window.confirm(`Delete "${doc.title || 'Untitled'}"?`)) {
                    onDelete(doc._id)
                  }
                }}
                aria-label={`Delete ${doc.title || 'Untitled'}`}
              >
                &times;
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
