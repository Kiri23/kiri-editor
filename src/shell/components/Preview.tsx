/**
 * UI Shell — Live Preview
 * Renders the generated markdown output.
 */

interface Props {
  markdown: string
}

export function Preview({ markdown }: Props) {
  return (
    <div className="preview">
      <h3>Preview</h3>
      <pre className="preview-content">{markdown}</pre>
    </div>
  )
}
