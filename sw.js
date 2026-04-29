// FitPro Service Worker — Web App
const CACHE = 'fitpro-v1';
const OFFLINE = ['./index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE))
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
  // Network first for API calls
  if (e.request.url.includes('supabase.co') || e.request.url.includes('api.anthropic')) {
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request).then(r => r || caches.match('./index.html'))
    )
  );
});
