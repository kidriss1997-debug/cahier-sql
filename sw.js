// Cahier SQL — service worker : met tout l'application en cache pour l'utiliser sans connexion.
const CACHE = "cahier-sql-02957b4379";
const FILES = ["./","fonts/baloo-2-latin-500-normal.woff2","fonts/baloo-2-latin-600-normal.woff2","fonts/baloo-2-latin-700-normal.woff2","fonts/baloo-2-latin-800-normal.woff2","fonts/jetbrains-mono-latin-400-normal.woff2","fonts/jetbrains-mono-latin-600-normal.woff2","fonts/nunito-latin-400-italic.woff2","fonts/nunito-latin-400-normal.woff2","fonts/nunito-latin-600-normal.woff2","fonts/nunito-latin-700-normal.woff2","fonts/nunito-latin-800-normal.woff2","icons/apple-180.png","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","index.html","manifest.webmanifest","pglite-postgis/index.js","pglite/chunk-2BOC2OMW.js","pglite/chunk-DDJLRBDX.js","pglite/chunk-F4GETNPB.js","pglite/chunk-JDT7TZ73.js","pglite/chunk-NNS5RQRF.js","pglite/chunk-QY3QWFKW.js","pglite/chunk-RYDTTX3G.js","pglite/contrib/pg_trgm.js","pglite/contrib/pgcrypto.js","pglite/contrib/unaccent.js","pglite/index.js","pg-initdb.wasm","pg-pg_trgm-tar-gz.wasm","pg-pgcrypto-tar-gz.wasm","pg-pglite-data.wasm","pg-pglite.wasm","pg-postgis-0.wasm","pg-postgis-1.wasm","pg-unaccent-tar-gz.wasm"];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const f of FILES) {
      if (await c.match(f)) continue;
      for (let i = 0; i < 3; i++) {
        try { const r = await fetch(f, { cache: 'reload' }); if (r.ok) { await c.put(f, r); break; } } catch (e) {}
      }
    }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE && k.startsWith('cahier-sql-')) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  event.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = req.mode === 'navigate' ? (await c.match('index.html')) : (await c.match(req, { ignoreSearch: true }));
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r.ok && url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) c.put(req, r.clone());
      return r;
    } catch (e) {
      if (req.mode === 'navigate') { const idx = await c.match('index.html'); if (idx) return idx; }
      return new Response('Hors ligne et fichier pas encore en cache.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
