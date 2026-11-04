// Сервис-воркер: страница открывается и без интернета.
// Сначала сеть (чтобы всегда была свежая версия), если сети нет, то сохранённая копия.
const CACHE = "raspisanie-v2";
const PAGE = "./index.html";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([PAGE, "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  const isPage = r.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith("/index.html");
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(isPage ? PAGE : r.url, copy)); }
      return res;
    }).catch(() => caches.match(isPage ? PAGE : r, { ignoreSearch: true }))
  );
});
