/**
 * UI Shell — Live Preview
 * Renders product-rendered HTML in an isolated iframe.
 * Loads the product's styles (Tailwind, theme.css) so preview matches the viewer.
 */

import type { ProductManifest } from '../../services/product-api'

interface Props {
  html: string
  isRendering: boolean
  manifest: ProductManifest | null
  productHost: string
}

export function Preview({ html, isRendering, manifest, productHost }: Props) {
  if (isRendering) {
    return (
      <div className="preview-loading">
        <p>Rendering preview...</p>
      </div>
    )
  }

  const tailwindScript = manifest?.tailwind
    ? '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>'
    : ''

  const styleLinks = (manifest?.previewStyles ?? [])
    .map(s => `<link rel="stylesheet" href="${productHost}/${s}">`)
    .join('\n')

  const srcdoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${tailwindScript}
  ${styleLinks}
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; background: #111827; color: #e5e7eb; line-height: 1.7; }
    h1, h2, h3, h4 { color: #f3f4f6; margin-top: 2rem; margin-bottom: 0.5rem; }
    h1 { font-size: 1.75rem; border-bottom: 1px solid #374151; padding-bottom: 0.5rem; }
    h2 { font-size: 1.35rem; }
    h3 { font-size: 1.1rem; color: #d1d5db; }
    p { margin: 0.75rem 0; }
    a { color: #60a5fa; }
    code { background: #1f2937; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
    pre { background: #1f2937; padding: 1rem; border-radius: 8px; overflow-x: auto; border: 1px solid #374151; }
    pre code { background: none; padding: 0; }
    hr { border: none; border-top: 1px solid #374151; margin: 2rem 0; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`

  return (
    <iframe
      srcDoc={srcdoc}
      className="preview-frame"
      title="Document preview"
      sandbox="allow-scripts allow-same-origin"
    />
  )
}
