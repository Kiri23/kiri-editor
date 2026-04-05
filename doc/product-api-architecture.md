# Product API Architecture

## The Pattern

```
Kiri Editor (shell generico)
    |  habla con
    v
Product API (contrato estandar — virtual routes via Service Worker)
    ^
    |  implementa (sirve archivos estaticos)
End Product (DocsifyTemplate, LaTeX Resume, Blog Engine...)
```

Kiri Editor is a generic visual editor shell. It does NOT know which product is behind the API. Each end product serves static files (schemas + render assets). A Service Worker in Kiri Editor caches these assets and exposes virtual API routes.

## Why This Pattern

- **Kiri Editor stays decoupled** — works for docs, resumes, blogs, or anything else
- **Each product owns its components** — add a new component in DocsifyTemplate, it appears in the editor instantly
- **Single responsibility** — the end product defines what exists and how it renders; the editor provides the editing UX
- **100% client-side** — no backend server needed. SW creates virtual routes from cached static assets
- **Offline capable** — after first load, SW serves from cache

## How It Works

### Service Worker Virtual Routes

The SW lives in Kiri Editor (`public/product-sw.js`). On startup:

1. Main thread registers SW and sends `CONFIGURE` message with `VITE_PRODUCT_API_HOST`
2. SW fetches the product's `manifest.json` from the host
3. SW downloads and caches: component schemas, render assets (jsyaml, marked, component JS, renderer engine)
4. SW creates virtual API routes that respond from cache/local execution

### The Contract

Every end product serves these static files:

#### `lib/api/manifest.json`

Tells the SW what to fetch:

```json
{
  "product": "docsify-template",
  "version": "1.0.0",
  "components": "lib/components",
  "schemas": ["entity-schema.schema.json", "..."],
  "renderAssets": ["lib/vendor/js-yaml.min.js", "lib/vendor/marked.min.js", "..."],
  "previewStyles": ["lib/styles/theme.css"],
  "tailwind": true
}
```

#### `lib/components/*.schema.json`

Component field definitions matching Kiri Editor's `ComponentDefinition` interface:

```typescript
interface ComponentDefinition {
  id: string           // e.g. "api-endpoint", "entity-schema"
  name: string         // Human-friendly name for the palette
  description: string  // What this component does
  icon: string         // SVG path (16x16 viewBox)
  fields: ComponentField[]
  display?: {          // Optional visual config for the editor canvas
    color: string
    layout: string
    summaryField: string
    // ...
  }
}
```

#### `lib/components/*.js`

Component render functions. Must be pure string concatenation (no DOM access at call time). The SW loads them via `new Function()`.

#### `lib/vendor/*.js` + `lib/plugins/component-renderer-engine.js`

Dependencies for server-side rendering in the SW context.

### Virtual Routes (exposed by SW)

| Route | Method | Description |
|---|---|---|
| `/api/components` | GET | Returns `ComponentDefinition[]` from cached schemas |
| `/api/render` | POST | Receives `{ markdown }`, returns `{ html }` via local rendering |
| `/api/manifest` | GET | Returns the product manifest |

### Editor Modes

- **Write mode**: User sees and edits structured blocks. The palette (from `/api/components`) lets them insert new blocks with form fields that generate YAML code fences.
- **Preview mode**: Editor sends the full markdown to `/api/render`. SW converts markdown to HTML using `marked`, then runs `processCodeFenceComponents()` with the loaded component JS. Result displayed in an isolated iframe with the product's styles.

## Host Configuration

The product API host is controlled by environment variable:

```
VITE_PRODUCT_API_HOST=http://localhost:3009   # dev (local DocsifyTemplate)
VITE_PRODUCT_API_HOST=https://docs.kiri.app   # prod (deployed product)
```

## First Implementation: DocsifyTemplate

DocsifyTemplate serves static files via `http-server --cors`:

```
DocsifyTemplate/
  lib/
    api/manifest.json              <-- SW entry point
    components/*.schema.json       <-- 8 component field definitions
    components/*.js                <-- 8 component render functions
    plugins/component-renderer-engine.js  <-- YAML fence processor
    vendor/js-yaml.min.js          <-- YAML parser
    vendor/marked.min.js           <-- Markdown parser
    styles/theme.css               <-- Preview styles
```

### New Component Workflow

1. Add `new-component.js` to `lib/components/`
2. Add `new-component.schema.json` with field definitions
3. Update `manifest.json` to include both files
4. Done — Kiri Editor's SW picks up the new component on next configure

## Future Products

Each new product serves the same manifest structure:

- **LaTeX Resume Builder**: schemas for experience, education, skills sections. Render assets produce PDF preview.
- **Blog Editor**: schemas for paragraph, code block, image, callout. Render assets produce static HTML.

The editor shell doesn't change. Only the `VITE_PRODUCT_API_HOST` points to a different product.

## Key Technical Decisions

| Decision | Choice | Why |
|---|---|---|
| API layer | Service Worker virtual routes | 100% client-side, no server needed |
| Schema format | `.schema.json` co-located with components | Human-editable, version-controlled |
| Rendering in SW | `new Function(code)()` for cross-origin JS | Component functions are pure string templates, SW-safe |
| Preview isolation | iframe with `srcDoc` | Product uses Tailwind; editor uses custom CSS. iframe prevents style leaks |
| Fallback | Hardcoded `fallbackComponents` in editor | Editor works before SW loads or if product is offline |
| Window shim | `self.window = self` in SW | Component JS assigns to `window.*`; in SW `self` is the global |
