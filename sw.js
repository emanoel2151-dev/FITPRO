// FitPro Service Worker — Web App
const CACHE = 'fitpro-v2';
const CORE  = ['./index.html', './'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Passthrough para APIs externas
  if (url.includes('supabase.co') || url.includes('api.anthropic')) return;
  // Passthrough para métodos não-GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      // Tenta a rede primeiro
      try {
        const netRes = await fetch(e.request);
        if (netRes && netRes.ok) {
          // Atualiza o cache com a resposta mais recente
          cache.put(e.request, netRes.clone());
        }
        return netRes;
      } catch (_) {
        // Offline: busca no cache
        const cached = await cache.match(e.request);
        if (cached) return cached;
        // Fallback para index.html (SPA)
        return cache.match('./index.html');
      }
    })
  );
});

