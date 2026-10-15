/// <reference lib="webworker" />

// This service worker is picked up automatically by react-scripts (CRA) at
// build time via workbox-webpack-plugin's InjectManifest — see
// node_modules/react-scripts/config/webpack.config.js. Nothing else needs to
// reference this file directly.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// `self.__WB_MANIFEST` is replaced at build time with the list of every
// hashed file CRA produced (main.[hash].js, main.[hash].css, etc). This line
// must exist somewhere in the file for InjectManifest to find it.
precacheAndRoute(self.__WB_MANIFEST);

// Explicit network-only guarantee for everything auth/session/MES-data
// related. These already aren't matched by any cache-serving route below,
// but registering them as NetworkOnly makes that guarantee explicit and
// future-proof: a route added later for a broader pattern (e.g. "/*") can't
// accidentally start caching login responses or live production/quality/
// machine-status data. Nothing here changes current behavior.
const isAuthOrApiRequest = ({ url }: { url: URL }) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth-api') ||
    url.pathname.startsWith('/tenant') ||
    url.pathname.startsWith('/iis') ||
    url.pathname.startsWith('/local-login'));

// GET reads (material/dispatch/query lookups, etc.) are NetworkOnly — never
// served from cache. Mutating methods are also explicitly NetworkOnly rather
// than left unmatched, so it's unambiguous in code that nothing here is ever
// queued for background-sync/offline replay (no BackgroundSyncPlugin is used
// anywhere in this file).
(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).forEach((method) => {
  registerRoute(isAuthOrApiRequest, new NetworkOnly(), method);
});

// App-shell routing: any navigation (typing a URL, hitting refresh, deep
// link) that isn't a request for a real file on disk gets index.html from
// the cache, so react-router can take over client-side — this is what makes
// deep links work offline.
const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/;
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    if (url.pathname.startsWith('/_')) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Runtime caching for logos/icons served from /public: serve the cached copy
// instantly, then refresh the cache in the background for next time.
registerRoute(
  ({ url }) => url.origin === self.location.origin && /\.(?:png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

// Offline fallback page: a static, bundle-independent page served only when
// a navigation can't be satisfied from the network OR the precache (e.g. the
// precache was partially evicted). Versioned so a new deploy can clean up the
// previous copy on activate — the hashed app-shell assets above are already
// auto-cleaned by workbox-precaching; this is the one cache it doesn't know
// about since offline.html isn't part of the webpack asset graph.
const OFFLINE_CACHE = 'offline-fallback-v1';
const OFFLINE_URL = process.env.PUBLIC_URL + '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_URL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('offline-fallback-') && key !== OFFLINE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// Global catch handler: only intercepts navigations (document loads). Any
// other failure (an /api, /auth-api, /tenant, /iis or /local-login request
// that's offline) is deliberately rethrown so it propagates as a normal
// network error to axios/fetch, exactly as it would with no service worker —
// never masked as a fake 200 response.
setCatchHandler(async ({ request }) => {
  if (request.mode === 'navigate') {
    const cached = await (await caches.open(OFFLINE_CACHE)).match(OFFLINE_URL);
    if (cached) return cached;
  }
  throw new Error('No offline fallback available for this request.');
});

// Lets the app force an already-downloaded update to activate immediately
// instead of waiting for every tab to close (see serviceWorkerRegistration.ts).
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
