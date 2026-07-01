// Bump this version string any time you push a new index.html so old
// installed clients pick up the change instead of freezing on stale cache.
const CACHE = "astrovision-v2";
const ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: always try to fetch the latest version from GitHub Pages.
// Only fall back to the cached copy if the network request fails (e.g.
// genuinely offline). This means every time you update index.html on
// GitHub and reopen the installed app, you get the new version — the
// cache exists purely as an offline fallback, not as the primary source.
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
