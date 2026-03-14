# Kiri Editor — Design System

## Direction

Document workbench. The canvas IS the document. Users write text and insert visual component blocks inline — like Notion, not like a code editor. YAML is an internal abstraction, never visible to users. Non-technical people use this too.

**Feel:** Organized workshop where every tool has its place. Dense enough to see what you're building, spacious enough to breathe. Warm document surface on a neutral workspace. The canvas is a page on a desk — paper metaphor with grain, slight rotation, and layered shadow.

## Intent

**Who:** A PO or technical writer (possibly non-technical) creating structured documentation. Working primarily on mobile (Pixel phone), switching between writing specs and reviewing output.

**Task:** Compose documentation pages from prose and visual component blocks. Add text, insert components between paragraphs, fill in their fields, publish.

**Feel:** Like writing in a document, not programming. Warm like a notebook, structured like a workbench.

## Palette

| Token | Value | Purpose |
|---|---|---|
| `--ink` | `#1a1a2e` | Primary text |
| `--ink-secondary` | `#4a4a5e` | Supporting text |
| `--ink-tertiary` | `#7a7a8e` | Metadata, type labels |
| `--ink-muted` | `#a0a0b0` | Disabled, placeholders |
| `--workspace` | `#eeedf0` | Background behind document |
| `--document` | `#faf9f7` | Document surface (warm parchment) |
| `--surface-elevated` | `#ffffff` | Popovers, dropdowns |
| `--blueprint` | `#3b82f6` | Interactive accent |
| `--blueprint-soft` | `rgba(59,130,246,0.08)` | Selection backgrounds |
| `--draft` | `#f59e0b` | Unsaved indicator |
| `--success` | `#22c55e` | GET method, positive states |
| `--danger` | `#ef4444` | DELETE method, destructive actions |

### Component Type Colors (3-tier system)

Each type has a solid color, a soft tint (5% for backgrounds), and a mid tint (12% for hover):

| Type | Solid | Soft | Mid |
|---|---|---|---|
| Data Model | `--type-schema: #8b5cf6` | `rgba(..., 0.05)` | `rgba(..., 0.12)` |
| API Endpoint | `--type-api: #06b6d4` | `rgba(..., 0.05)` | `rgba(..., 0.12)` |
| Flow Diagram | `--type-diagram: #f59e0b` | `rgba(..., 0.05)` | `rgba(..., 0.12)` |
| Text | `--type-text: #64748b` | `rgba(..., 0.04)` | `rgba(..., 0.10)` |

## Depth Strategy

**Borders-dominant** (79 borders, 11 shadows). Shadows are functional only — never decorative.

- **Borders:** 3 tiers — `0.05` soft, `0.08` standard, `0.15` emphasis
- **Page shadow:** `--shadow-page` — 4-layer shadow for the paper-on-desk metaphor
- **FAB shadow:** Layered `0 2px 8px` + `0 6px 20px` for lift
- **Selected blocks:** `0 0 0 3px var(--blueprint-soft)` focus ring
- **Drawer/sheet:** Directional shadows for overlays

## Surfaces

Two temperature zones:
- **Workspace** (`#eeedf0`): Cool neutral. The desk.
- **Document** (`#faf9f7`): Warm parchment. The page. Paper grain texture via SVG noise at 3% opacity. Slight rotation (`-0.3deg` desktop, none on mobile).
- **Header/File tree**: Same document surface, separated by thin borders.

## Typography

### Families (3 roles)

| Role | Font | Uses | Why |
|---|---|---|---|
| UI | `Inter`, system-ui | 12 | Clean, precise, doesn't compete with content |
| Document | `Georgia`, serif | 3 | Feels like a document (prose block summaries) |
| Code | `SF Mono`, `Fira Code` | 5 | API paths, method badges, technical inputs |

### Scale (4 steps)

| Token | Size | Uses | Role |
|---|---|---|---|
| `--text-sm` | 12px | 15 | Labels, captions, small UI text |
| `--text-base` | 14px | 20 | Body text, form inputs, default |
| `--text-md` | 16px | 3 | Entity names, insert buttons |
| `--text-lg` | 20px | 2 | Page title, empty state heading |

Each step is a 2px jump. Nothing below 12px (mobile readability). Use font-weight and color for secondary differentiation, not sub-pixel size differences.

### Weights

- `500` — body text, buttons
- `600` — labels, headings, type badges
- `700` — method badges (GET, POST, etc.)

### Tracking

One token: `--tracking-wide: 0.6px` — used on all uppercase labels. Logo gets inline `-0.5px` (one-off).

## Spacing

8px base unit (`--sp-2`). Scale with usage:

| Token | Value | Uses | Purpose |
|---|---|---|---|
| `--sp-1` | 4px | 15 | Tight gaps, inner padding |
| `--sp-2` | 8px | 29 | Default gap, list spacing |
| `--sp-3` | 12px | 22 | Section padding, comfortable gaps |
| `--sp-4` | 16px | 13 | Block padding, form fields |
| `--sp-5` | 24px | 12 | Panel padding, major sections |
| `--sp-6` | 32px | 3 | Empty state section gaps |
| `--sp-8` | 48px | 3 | Canvas padding (desktop) |

## Radius

| Token | Value | Uses | Purpose |
|---|---|---|---|
| `--radius-sm` | 4px | 9 | Inputs, small buttons, badges, pills |
| `--radius-md` | 6px | 8 | Component blocks, controls, cards |
| `--radius-lg` | 10px | 2 | FAB palette, bottom sheet corners |

Document canvas uses `border-radius: 1px` (sharp corners — paper metaphor).

## Signature Elements

### Colored left-border blocks
Component blocks have a **3px colored left border** + **type-tinted background**. Each type gets its own color at three intensities (solid for border, soft for bg, mid for hover). Like colored tabs in a physical binder.

### Block layout variants
Each block type has its own internal layout, controlled by `block-display.ts`:
- **prose** — serif font, content-forward (Text blocks)
- **badge** — colored method badge + monospace path (API Endpoints)
- **entity** — bold name + property count (Data Models)
- **diagram** — title + participant pills (Flow Diagrams)

### Paper canvas
The document canvas is styled as a real page on a desk: sharp corners, 4-layer shadow, slight rotation, SVG noise grain texture.

## Layout

- **Header:** Logo left, document title centered (editable), actions right. 52px height.
- **File tree:** Slide-in drawer (hamburger toggle in header). 200px desktop, 240px mobile.
- **Canvas:** Centered document (max-width 680px) on workspace background. Blocks stack vertically with insert gaps between them.
- **FAB:** Floating action button (bottom-right) opens a popover palette with block names + descriptions. Replaces permanent sidebar.
- **Property Panel:** Slides in from right (320px) when a block is selected. Close to deselect.
- **Insert gaps:** `+` button between blocks opens inline mini-palette for positional insertion.

## Buttons

| Pattern | Background | Border | Radius | Padding |
|---|---|---|---|---|
| Primary (Publish) | `--ink` | none | `--radius-md` | `sp-1 / sp-4` |
| Danger (Remove) | transparent | `1px --danger` | `--radius-md` | `sp-2` |
| FAB | `--ink` | none | 50% (circle) | — (52×52) |
| Ghost (insert pills) | `--surface-elevated` | `1px --border` | 100px | `sp-1 / sp-3` |

## Responsive Breakpoints

| Breakpoint | File Tree | Canvas | Property Panel | FAB |
|---|---|---|---|---|
| Desktop (> 1024px) | Inline drawer | Centered 680px, rotated paper | Side panel 320px | 52px, bottom-right |
| Tablet (< 1024px) | Overlay drawer | Fills space, slight rotation | Narrower 280px | 52px |
| Mobile (< 640px) | Overlay drawer | Full width, flat paper | Bottom sheet (60vh) | 48px |

## Transitions

All 18 transitions use `var(--duration): 150ms` and `var(--ease): cubic-bezier(0.25, 0.1, 0.25, 1)`. Two animations:
- `fabPaletteIn` — 150ms fade-up for FAB popover
- `insertPaletteIn` — 150ms fade-up for inline insert palette

## Key Decisions

- YAML is never shown to users. It's an output format, not an editing format.
- Jargon-free naming: "Data Model" not "Entity Schema", "Flow Diagram" not "Sequence Diagram".
- FAB replaces permanent sidebar — 4 items don't justify 200px of permanent space.
- Insert-between-blocks via `+` gaps fulfills the Notion-like promise.
- Paper metaphor on canvas (rotation, grain, shadow) — not generic rounded-rectangle cards.
- "Unsaved" indicator, not "Draft" (unambiguous state communication).
- Block type labels colored to match their type, not generic gray.
- All CSS values use variables — branding is swappable by changing `:root`.
- Block display config (`block-display.ts`) controls visual personality per type — swappable without touching components.

## Planned (Not Yet Built)

- Slash command (`/`) to insert components inline
- Drag-to-reorder blocks
- Rich text editing within text blocks (TipTap/ProseMirror)
- GitHub API publish (commit to repo)
