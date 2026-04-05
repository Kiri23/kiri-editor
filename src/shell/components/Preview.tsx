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
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; background: #1a1a2e; color: #e0e0e0; }
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
