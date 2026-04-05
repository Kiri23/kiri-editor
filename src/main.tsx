import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'

// Register Product Service Worker for virtual API routes (/api/components, /api/render)
if ('serviceWorker' in navigator) {
  const productHost = import.meta.env.VITE_PRODUCT_API_HOST as string

  navigator.serviceWorker.register('/product-sw.js').then((reg) => {
    const sendConfig = (sw: ServiceWorker) => {
      sw.postMessage({ type: 'CONFIGURE', host: productHost })
    }

    if (reg.active) {
      sendConfig(reg.active)
    }

    // SW is installing or waiting — send config once it activates
    if (reg.installing || reg.waiting) {
      const sw = reg.installing || reg.waiting!
      sw.addEventListener('statechange', () => {
        if (sw.state === 'activated') sendConfig(sw)
      })
    }

    // Send config when a new SW takes over
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (navigator.serviceWorker.controller) {
        sendConfig(navigator.serviceWorker.controller)
      }
    })
  })

  // SW woke up without config — re-send it
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_NEED_CONFIG') {
      navigator.serviceWorker.controller?.postMessage({ type: 'CONFIGURE', host: productHost })
    }
  })
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
)
