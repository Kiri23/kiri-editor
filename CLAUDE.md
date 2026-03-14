# Kiri Editor

Universal visual editor platform. Same UI shell, swappable palette + renderer.

## Vision

One editor UI that powers multiple products by swapping the middle layer:
- **Doc Editor**: YAML components → Docsify viewer (first product)
- **Resume Builder**: experience/skills → LaTeX → PDF (future)
- **Blog Editor**: markdown blocks → static HTML (future)

## Architecture (Engineering DNA — 4 Layers)

```
1. Model (DDD)         → Component schemas, data structures per product
2. ViewModel           → BuilderPalette interface (getComponents, updateProperty, publish)
3. Headless Hook       → Orchestrates effects (GitHub API, file generation, preview)
4. UI Shell (FIXED)    → Component palette + property editor + live preview
```

The UI calls the same interface regardless of which product is active.

### The Contract

```typescript
interface BuilderPalette {
  getComponents(): Component[]
  getProperties(id): Property[]
  updateProperty(id, key, value)
  preview(): string
  publish(): void
}
```

## First Product: Doc Editor for DocsifyTemplate

- PO sees component palette (entity-schema, api-endpoint, etc.)
- Fills form fields → generates YAML code fences internally
- Live preview via component-renderer.js
- Publish → GitHub API commit → Docsify viewer reads from raw.githubusercontent.com
- Two separate sites: Editor (private, React) and Viewer (public, Docsify zero-build)

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript | Editor UI |
| Backend/DB | Convex | Auth, roles, user management, project metadata |
| Auth | Convex + Clerk | Multi-user, roles (admin/editor/viewer) |
| Content Storage | GitHub API | .md files, YAML components (repo = content DB) |
| Versioning | Git branches/tags | Document versions without extra DB |
| Viewer | Docsify | Reads from raw.githubusercontent.com (zero-build, separate site) |
| Preview | component-renderer.js | From DocsifyTemplate, renders YAML → HTML |

### Why Convex

- **SOC 2 Type II compliant** — required for work/enterprise use (Akcelita)
- Also HIPAA and GDPR compliant, hosted on AWS
- Real-time reactive queries — live preview updates, collaborative editing potential
- Built-in auth via Clerk integration — multi-user, roles, permissions
- Serverless, zero config — no infrastructure to manage
- TypeScript native — matches frontend stack
- Built-in components and AI tooling — easy to add AI features later (smart suggestions, auto-categorization, content generation)
- Convex handles: users, roles, permissions, project metadata, editor state
- Git handles: content (.md files), versioning (branches/tags), publishing

### What Lives Where

```
Convex DB:  users, roles, permissions, project config, editor metadata
GitHub:     .md files, YAML components, versions (branches), publishing
Docsify:    viewer (reads GitHub raw URLs, zero-build, separate deploy)
```

## Development Setup (Termux)

This project lives in **two locations** due to Android shared storage limitations:

| Location | Purpose | Why |
|---|---|---|
| `~/kiri-editor/` | **Development** — `npm install`, `npm run dev`, build | Termux internal storage has execute permissions for binaries (esbuild, etc.) |
| `~/Code/kiri-editor/` | **Git** — commits, pushes | Shared storage (`~/Code/` → `/storage/emulated/0/Documents/Code/`), visible to other apps |

**Android shared storage cannot execute binaries or create symlinks**, so `npm install` fails there. All development happens in `~/kiri-editor/`, then files are synced to `~/Code/kiri-editor/` for git.

### Sync & Push Workflow

After making changes in `~/kiri-editor/`:

```bash
# Sync source files (never sync node_modules or dist)
cp -r ~/kiri-editor/src/* ~/Code/kiri-editor/src/
cp -r ~/kiri-editor/convex/* ~/Code/kiri-editor/convex/
# Add any new root files too (package.json, etc.)

# Commit and push from shared storage
cd ~/Code/kiri-editor && git add . && git commit -m "message" && git push
```

### Running the dev server

```bash
cd ~/kiri-editor && npx vite --host
# Opens at http://localhost:5173
```

Convex backend runs in the cloud (already deployed). Run `npx convex dev --once` after changing convex/ files.

## Related Projects

- DocsifyTemplate: https://github.com/Kiri23/DocsifyTemplate (viewer)
- Custom React Renderer: https://github.com/Kiri23/customReactRenderer (resume renderer)
- Kiri Web Framework: https://github.com/Kiri23/deno-vite-react-tailwind (server patterns)
