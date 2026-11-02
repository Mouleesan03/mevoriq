/* Mevoriq service worker: installable app, offline fallback, and public cards (incl. Meeting Mode) that open without signal. */
const VERSION = "mevoriq-v1";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const PRECACHE = ["/offline", "/brand/pwa-icon-192.png", "/brand/mevoriq-symbol.svg"];

// Public pages that are safe to keep on the device. Signed-in areas are never cached.
const CACHEABLE_PAGE = /^\/(u\/[^/]+(\/meeting)?|offline|features|templates|teams|pricing|about|privacy|terms|cookies)?\/?$/;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

/** Also keeps the CSS/JS a cached page needs, so it renders properly offline. */
async function cachePage(url, response) {
  const cache = await caches.open(PAGES);
  await cache.put(url, response.clone());
  const html = await response.clone().text();
  const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) || [])].slice(0, 60);
  const statics = await caches.open(STATIC);
  await Promise.all(assets.map((a) => statics.match(a).then((hit) => hit || fetch(a).then((r) => r.ok && statics.put(a, r)).catch(() => {}))));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Versioned build assets and brand files never change: cache first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/brand/")) {
    event.respondWith(
      caches.open(STATIC).then((c) =>
        c.match(req).then((hit) => hit || fetch(req).then((res) => (res.ok && c.put(req, res.clone()), res))),
      ),
    );
    return;
  }

  if (req.mode !== "navigate") return;
  const cacheable = CACHEABLE_PAGE.test(url.pathname);
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (cacheable && res.ok && res.type === "basic") event.waitUntil(cachePage(url.pathname, res.clone()));
        return res;
      })
      .catch(async () => (cacheable && (await caches.match(url.pathname))) || (await caches.match("/offline")) || Response.error()),
  );
});

// The app asks us to keep the owner's own card pages ready for offline use.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "cache-pages") return;
  const paths = (event.data.paths || []).filter((p) => typeof p === "string" && CACHEABLE_PAGE.test(p)).slice(0, 10);
  event.waitUntil(
    Promise.all(paths.map((p) => fetch(p, { credentials: "omit" }).then((res) => res.ok && cachePage(p, res)).catch(() => {}))),
  );
});
