// Service worker: permite instalar la página como app y usarla con mala conexión.
const CACHE = "calle-publica-v1";
const BASE = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Archivos propios (página, fotos): primero red, y si falla, lo guardado.
// Recursos externos (Google Sheets, fuentes): conexión normal.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
