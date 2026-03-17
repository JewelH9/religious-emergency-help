// ============================================
// sw.js — Service Worker
// Provides offline support via cache-first strategy
// ============================================

const CACHE_NAME = "reh-cache-v1";
const OFFLINE_PAGE = "offline.html";

// ---- Files to cache immediately on install ----
const PRECACHE_URLS = [
  "/",
  "index.html",
  "emergency.html",
  "religion.html",
  "search.html",
  "bookmarks.html",
  "login.html",
  "404.html",
  "offline.html",
  "css/style.css",
  "js/app.js",
  "js/lang.js",
  "js/firebase-config.js",
  "js/auth.js",
  "js/db.js",
  "js/search.js",
  "js/bookmarks.js",
  "js/pdf.js",
  "js/admin.js",
  "lang/en.json",
  "lang/hi.json",
  "lang/bn.json",
  "manifest.json",
  "images/icon-192.png",
  "images/icon-512.png",
];

// ---- Firebase CDN scripts to cache ----
const FIREBASE_URLS = [
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js",
];

// ============================================================
// INSTALL — cache all static assets
// ============================================================
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("[SW] Caching static assets...");

      // Cache local files — ignore individual failures
      const localResults = await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache
            .add(url)
            .catch((err) => console.warn(`[SW] Failed to cache: ${url}`, err)),
        ),
      );

      // Cache Firebase CDN files
      const firebaseResults = await Promise.allSettled(
        FIREBASE_URLS.map((url) =>
          fetch(url, { mode: "cors" })
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch((err) =>
              console.warn(`[SW] Firebase cache failed: ${url}`, err),
            ),
        ),
      );

      console.log("[SW] Install complete");
    }),
  );

  // Take control immediately without waiting
  self.skipWaiting();
});

// ============================================================
// ACTIVATE — clean up old caches
// ============================================================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            }),
        );
      })
      .then(() => {
        console.log("[SW] Activated — claiming clients");
        return self.clients.claim();
      }),
  );
});

// ============================================================
// FETCH — serve from cache, fall back to network
// ============================================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Firebase API calls (auth + Firestore must go to network)
  if (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com") ||
    url.hostname.includes("securetoken.googleapis.com")
  ) {
    return; // Let Firebase handle its own network calls
  }

  // ---- Strategy: Cache First, then Network ----
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        // In background, try to refresh the cache
        refreshCache(request);
        return cachedResponse;
      }

      // Not in cache — try network
      try {
        const networkResponse = await fetch(request);

        // Cache successful responses for future offline use
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        // Network failed — serve offline page for HTML requests
        if (request.headers.get("Accept")?.includes("text/html")) {
          const offlinePage = await caches.match(OFFLINE_PAGE);
          return (
            offlinePage ||
            new Response("<h1>You are offline</h1>", {
              headers: { "Content-Type": "text/html" },
            })
          );
        }

        // For other failed requests return empty response
        return new Response("", { status: 408 });
      }
    }),
  );
});

// ---- Background cache refresh ----
function refreshCache(request) {
  fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
      }
    })
    .catch(() => {}); // Silently fail if offline
}

// ============================================================
// MESSAGE — handle cache update requests from the page
// ============================================================
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "CACHE_GUIDE") {
    // Cache a specific guide URL on demand
    const { url } = event.data;
    if (url) {
      caches.open(CACHE_NAME).then((cache) => {
        fetch(url)
          .then((res) => {
            if (res.ok) cache.put(url, res);
          })
          .catch(() => {});
      });
    }
  }
});
