/**
 * Product Service Worker — Virtual API routes for Product integration
 *
 * Fetches component schemas and render assets from a Product host (e.g., DocsifyTemplate),
 * caches them, and exposes virtual routes:
 *   GET  /api/components → ComponentDefinition[]
 *   POST /api/render     → { html: string }
 *   GET  /api/manifest   → product manifest
 *
 * Generic — any product that serves a manifest.json can plug in.
 *
 * NOTE: SW can be stopped/restarted by the browser at any time.
 * All render assets are cached and re-evaluated on wake-up.
 */

// Shim: component JS files assign to `window.*`, but SW global is `self`
self.window = self;

const CACHE_NAME = 'product-api-v1';
let renderReady = false;
let renderLoading = null; // promise to dedupe

// --- Lifecycle ---

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// --- Configuration via postMessage ---

self.addEventListener('message', (event) => {
  if (event.data.type === 'CONFIGURE') {
    const productHost = event.data.host;
    renderLoading = fetchAndCacheAssets(productHost).then(() => {
      renderLoading = null;
    }).catch(e => {
      console.error('[product-sw] Configuration failed:', e);
      renderLoading = null;
    });
  }
});

/**
 * Fetch all assets from the product host and cache them.
 * Also evaluates render assets into the SW scope.
 */
async function fetchAndCacheAssets(productHost) {
  // 1. Fetch manifest
  const res = await fetch(`${productHost}/lib/api/manifest.json`);
  if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
  const manifest = await res.json();

  const cache = await caches.open(CACHE_NAME);

  // 2. Fetch and cache component schemas
  const schemas = [];
  for (const schemaFile of manifest.schemas) {
    const r = await fetch(`${productHost}/${manifest.components}/${schemaFile}`);
    if (r.ok) schemas.push(await r.json());
  }
  await cache.put(
    new Request('/api/components'),
    new Response(JSON.stringify(schemas), { headers: { 'Content-Type': 'application/json' } })
  );

  // 3. Fetch render assets and cache their source code
  const assetCodes = [];
  for (const asset of manifest.renderAssets) {
    const r = await fetch(`${productHost}/${asset}`);
    if (!r.ok) {
      console.warn(`[product-sw] Failed to load ${asset}: ${r.status}`);
      continue;
    }
    const code = await r.text();
    assetCodes.push({ asset, code });
  }
  // Cache the raw JS source so we can re-evaluate after SW restarts
  await cache.put(
    new Request('/api/_render-assets'),
    new Response(JSON.stringify(assetCodes), { headers: { 'Content-Type': 'application/json' } })
  );

  // 4. Evaluate render assets into SW scope
  evalAssets(assetCodes);

  // 5. Cache manifest
  await cache.put(
    new Request('/api/manifest'),
    new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/json' } })
  );

  console.log('[product-sw] Product assets loaded:', manifest.product, manifest.version);
  reportStatus('ready', `marked: ${typeof self.marked}, jsyaml: ${typeof self.jsyaml}, __CREngine: ${typeof self.__CREngine}`);
}

/**
 * Evaluate cached render assets into the SW scope.
 * Called on first configure AND on wake-up from cache.
 */
function evalAssets(assetCodes) {
  for (const { asset, code } of assetCodes) {
    try {
      new Function(code).call(self);
    } catch (e) {
      console.error(`[product-sw] Error evaluating ${asset}:`, e);
    }
  }
  renderReady = true;
}

/**
 * Ensure render assets are loaded into memory.
 * If the SW was restarted, re-evaluate from cache.
 * If cache is empty, ask the main thread for the host and fetch fresh.
 */
async function ensureRenderReady() {
  if (renderReady) return true;
  if (renderLoading) { await renderLoading; return renderReady; }

  // SW was restarted — try to reload assets from cache
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(new Request('/api/_render-assets'));
  if (cached) {
    try {
      const assetCodes = await cached.json();
      evalAssets(assetCodes);
      console.log('[product-sw] Render assets restored from cache');
      return true;
    } catch (e) {
      console.error('[product-sw] Failed to restore render assets:', e);
    }
  }

  // Cache miss — ask the main thread for the product host
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.data?.type === 'CONFIGURE') {
          self.removeEventListener('message', handler);
          const host = event.data.host;
          renderLoading = fetchAndCacheAssets(host).then(() => {
            renderLoading = null;
            resolve(renderReady);
          }).catch(() => {
            renderLoading = null;
            resolve(false);
          });
        }
      };
      self.addEventListener('message', handler);
      // Ask the main thread to re-send config
      clients.forEach(c => c.postMessage({ type: 'SW_NEED_CONFIG' }));
      // Timeout after 5s
      setTimeout(() => resolve(false), 5000);
    });
  }

  return false;
}

function reportStatus(status, details) {
  self.clients.matchAll().then(clients => {
    clients.forEach(c => c.postMessage({ type: 'SW_STATUS', status, details }));
  });
}

// --- Fetch interception: virtual API routes ---

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/api/')) return;

  if (url.pathname === '/api/components' && event.request.method === 'GET') {
    event.respondWith(handleCached('/api/components', '[]'));
    return;
  }

  if (url.pathname === '/api/manifest' && event.request.method === 'GET') {
    event.respondWith(handleCached('/api/manifest', '{}'));
    return;
  }

  if (url.pathname === '/api/render' && event.request.method === 'POST') {
    event.respondWith(handleRender(event.request));
    return;
  }
});

async function handleCached(key, fallback) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(new Request(key));
  if (cached) return cached.clone();
  return new Response(fallback, { status: 200, headers: { 'Content-Type': 'application/json' } });
}

async function handleRender(request) {
  const ready = await ensureRenderReady();

  if (!ready || !self.marked?.parse) {
    return new Response(
      JSON.stringify({ html: '<p>Renderer not available. Try refreshing.</p>' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { markdown } = await request.json();

    // 1. Markdown → HTML
    let html = self.marked.parse(markdown);

    // 2. Process YAML code fences → rendered component HTML
    if (self.__CREngine?.processCodeFenceComponents) {
      html = self.__CREngine.processCodeFenceComponents(html);
    }

    return new Response(JSON.stringify({ html }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ html: '<p style="color:red">Render error: ' + e.message + '</p>' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
