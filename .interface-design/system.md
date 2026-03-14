# Kiri Editor — Design System

## Direction

Document workbench. The canvas IS the document. Users write text and insert visual component blocks inline — like Notion, not like a code editor. YAML is an internal abstraction, never visible to users. Non-technical people use this too.

**Feel:** Organized workshop where every tool has its place. Dense enough to see what you're building, spacious enough to breathe. Warm document surface on a neutral workspace.

## Intent

**Who:** A PO or technical writer (possibly non-technical) creating structured documentation. At their desk, switching between writing specs and reviewing output.

**Task:** Compose documentation pages from prose and visual component blocks. Add text, insert components between paragraphs, fill in their fields, publish.

**Feel:** Like writing in a document, not programming. Warm like a notebook, structured like a workbench.

## Palette

| Token | Value | Purpose |
|---|---|---|
| `--ink` | `#1a1a2e` | Primary text |
| `--ink-secondary` | `#4a4a5e` | Supporting text |
| `--ink-tertiary` | `#7a7a8e` | Metadata, labels |
| `--ink-muted` | `#a0a0b0` | Disabled, placeholders |
| `--workspace` | `#eeedf0` | Background behind document |
| `--document` | `#faf9f7` | Document surface (warm parchment) |
| `--surface-elevated` | `#ffffff` | Component blocks, dropdowns |
| `--blueprint` | `#3b82f6` | Interactive accent |
| `--blueprint-soft` | `rgba(59,130,246,0.08)` | Selection backgrounds |
| `--draft` | `#f59e0b` | Unsaved/draft indicator |
| `--danger` | `#ef4444` | Destructive actions |

### Component Type Colors

Each component type has a signature color for its left-border accent and palette dot:

| Type | Token | Value |
|---|---|---|
| Entity Schema | `--type-schema` | `#8b5cf6` (purple) |
| API Endpoint | `--type-api` | `#06b6d4` (cyan) |
| Sequence Diagram | `--type-diagram` | `#f59e0b` (amber) |
| Text Block | `--type-text` | `#64748b` (slate) |

## Depth Strategy

**Borders-only** for the workspace structure. The document canvas has a subtle box-shadow to lift it off the workspace — it's "the page on the desk." Component blocks use left-border accent by type. No dramatic shadows anywhere.

- Borders: `rgba(0,0,0,0.08)` standard, `0.05` soft, `0.15` emphasis
- Document shadow: `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)`
- Selected blocks: `0 0 0 3px var(--blueprint-soft)` focus ring

## Surfaces

Two temperature zones:
- **Workspace** (`--workspace: #eeedf0`): Cool neutral. The desk.
- **Document** (`--document: #faf9f7`): Warm parchment. The page.
- **Sidebar/Header**: Same as document surface, separated by thin borders. One continuous surface, not fragmented.

## Typography

| Role | Font | Why |
|---|---|---|
| UI (labels, buttons, nav) | `Inter`, system-ui | Clean, precise, doesn't compete with content |
| Document content (block summaries) | `Georgia`, serif | Feels like a document, not a dashboard |
| Code fields (YAML inputs) | `SF Mono`, `Fira Code` | Technical inputs need monospace |

## Spacing

8px base unit (`--sp-2`). Scale: 4, 8, 12, 16, 24, 32, 48, 64.

## Radius

- `--radius-sm: 4px` — inputs, small buttons
- `--radius-md: 6px` — cards, component blocks, controls
- `--radius-lg: 10px` — document canvas, modals

## Signature Element

Component blocks with **colored left-border by type** (3px). Purple for schemas, cyan for APIs, amber for diagrams, slate for text. Each block in the document flow shows its type at a glance — like colored tabs in a physical binder.

Palette items echo this with small colored dots.

## Layout

- **Header:** Logo left, document title centered, actions right. 52px height.
- **Sidebar:** Component palette (220px). Insert blocks from here.
- **Canvas:** Centered document (max-width 680px) on workspace background. Blocks stack vertically.
- **Property Panel:** Slides in from right (320px) when a block is selected. Close to deselect.
- **Future:** File/folder tree sidebar for document navigation (after Convex persistence).

## Responsive Breakpoints

| Breakpoint | Sidebar | Canvas | Property Panel |
|---|---|---|---|
| Desktop (> 1024px) | Full with labels | Centered 680px | Side panel 320px |
| Tablet (< 1024px) | Collapsed to dots (56px) | Fills space | Narrower 280px |
| Mobile (< 640px) | Horizontal scrollable strip | Full width, no shadow | Bottom sheet overlay (60vh) |

## Key Decisions

- YAML is never shown to users. It's an output format, not an editing format.
- The editing experience is a text editor with insertable visual blocks, not a form builder.
- Sidebar and header share document surface color — one continuous surface, not fragmented zones.
- Component blocks are inline in the document flow, not in a separate list.
- Property panel appears contextually when a block is selected, not always visible.
- Block remove button is hidden until hover (desktop) or always visible (mobile).

## Planned (Not Yet Built)

- Slash command (`/`) to insert components inline
- Drag-to-reorder blocks
- File/folder tree sidebar (after Convex persistence)
- Rich text editing within text blocks (TipTap/ProseMirror)
