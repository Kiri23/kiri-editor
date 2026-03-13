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

## Tech Stack (TBD)

- Frontend: React or Preact
- Auth: GitHub OAuth (for the doc editor product)
- Storage: GitHub API (repo = database for docs)
- Preview: component-renderer.js from DocsifyTemplate

## Related Projects

- DocsifyTemplate: https://github.com/Kiri23/DocsifyTemplate (viewer)
- Custom React Renderer: https://github.com/Kiri23/customReactRenderer (resume renderer)
- Kiri Web Framework: https://github.com/Kiri23/deno-vite-react-tailwind (server patterns)
