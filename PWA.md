# OneScan — PWA Implementation

This documents the Progressive Web App work done on top of the existing
CRA/TypeScript/React 19 MES frontend ("OneScan", tenant CriticalManufacturing).
The original web application, its routing, and its authentication/backend
integration are unchanged — everything below is additive.

## 1. Capabilities added

- **Real branding** in `manifest.json` and icons (previously CRA's "React App"
  defaults).
- **Installable** on desktop (Chrome/Edge) and mobile (Android Chrome, iOS
  Safari via `apple-touch-icon`/`apple-mobile-web-app-*` meta tags), with a
  small in-app install prompt.
- **Online/offline status banner**, visible app-wide including the login
  screen.
- **Offline fallback page** (`/offline.html`) for the case where a navigation
  can't be served from the network or the precache.
- **Explicit, self-documenting network-only routing** for all auth/session/MES
  data endpoints, so nothing sensitive can ever be served from or written to
  a cache.
- **Cache cleanup on new deploys** for the one cache Workbox doesn't already
  auto-manage (the offline-fallback page).

What was **already in place** before this pass and is unchanged: the Workbox
precache of the app shell, the app-shell navigation routing (deep links work
offline once the shell has loaded once), the `StaleWhileRevalidate` image
cache, and the "new version available, reload?" update-prompt flow in
`src/index.tsx`.

## 2. Files changed, and why

| File | Why |
|---|---|
| `public/manifest.json` | Real name/branding/colors, `any` + `maskable` icons |
| `public/icons/icon-*.png` (new) | Generated from `public/images/ATSTabLogo.png` |
| `public/index.html` | `apple-touch-icon`, iOS/Android install meta tags, matching `theme-color` |
| `public/offline.html` (new) | Last-resort offline page (Retry + Back, no app-bundle dependency) |
| `src/service-worker.ts` | Explicit `NetworkOnly` routes for `/api`, `/auth-api`, `/tenant`, `/iis`, `/local-login`; offline-page caching + `setCatchHandler`; versioned cache cleanup on `activate` |
| `src/components/PwaStatus/InstallPrompt.tsx` (new) | Install UX (`beforeinstallprompt` + iOS hint) |
| `src/components/PwaStatus/NetworkStatusBanner.tsx` (new) | Online/offline banner |
| `src/components/PwaStatus/index.styled.tsx` (new) | Styled-components for the above, following the existing `MessageModal` pattern |
| `src/App.tsx` | Mounts the two new components unconditionally (same spot as `FloatingKeypad`) |
| `src/locales/en.json` | New `pwa` string block, following the existing `Labels.*` i18n convention |
| `src/global.d.ts` | `BeforeInstallPromptEvent` / `Navigator.standalone` type declarations (not yet in lib.dom) |
| `src/App.test.tsx` | Fixed — the default CRA test asserted a "learn react" link that doesn't exist in this app and never rendered inside the real provider tree; now a real smoke test |
| `src/manifest.test.ts` (new) | Validates manifest fields + that every referenced icon file exists |
| `src/components/PwaStatus/*.test.tsx` (new) | RTL tests for install/offline UI |
| `src/setupTests.ts` | Test-environment polyfills (see §9) |
| `package.json` | `jest.moduleNameMapper` (see §9); **no new dependencies** |

**Not touched, by design:** `server.js`, `src/setupProxy.js`, `src/context/AuthContext.tsx`, `src/Helpers/apiClient.ts`, `src/api.ts`, `public/web.config`.

## 3. Auth/backend compatibility

The real login flow: the browser POSTs credentials to `/local-login` →
`server.js` (prod, port 3001 behind IIS rewrite) or `src/setupProxy.js` (dev)
performs the actual CMF/AD handshake server-side → returns an `access_token`
→ the browser sets it as a cookie → `apiClient.ts` attaches it as a `Bearer`
header on every request. None of this changed.

The service worker now **explicitly** declares `/api`, `/auth-api`,
`/tenant`, `/iis`, and `/local-login` as `NetworkOnly` for every HTTP method
(GET/POST/PUT/PATCH/DELETE) — previously this was true only because no route
matched those paths; now it's unambiguous in code and can't regress if a
broader route is added later. A failed auth/API request while offline still
propagates as a normal rejected `fetch`/`axios` error — the global offline
`setCatchHandler` only intercepts `navigate`-mode (document) requests and
rethrows everything else, so axios's existing error handling in
`apiClient.ts` is unaffected.

## 4. Caching strategy

| Resource | Strategy |
|---|---|
| Hashed JS/CSS (webpack output) | Precache, auto-cleaned by Workbox on activate |
| Images under `/public` | `StaleWhileRevalidate`, capped at 60 entries / 30 days |
| Navigation (app shell) | Precached `index.html`, serves offline once visited |
| Navigation with no usable precache | `offline.html`, served via `setCatchHandler`, cached with a versioned name (`offline-fallback-v1`) that's cleaned up on `activate` |
| `/api`, `/auth-api`, `/tenant`, `/iis`, `/local-login` — all auth, session, and MES data (machine status, work orders, quality, maintenance) | `NetworkOnly`, every method — never cached, never queued |

No `BackgroundSyncPlugin` is used anywhere, so POST/PUT/PATCH/DELETE requests
are never queued for offline replay — a transaction made while offline fails
immediately and visibly, exactly as it would with no service worker.

## 5. Offline read-only MES data — assessed, not implemented

Reviewed every page (Material, Dispatch, Track-In/Out, Hold/Release, Rework,
Split/Merge, etc.): all of them are **live transactional actions**, not
read-only browsing views, and there's no stated business need to view stale
MES data offline. Implementing that risks presenting stale production/quality
data as current, so **it was not built**. If it's wanted later, the design
should be: an explicit allow-list of read-only data types, storage in
IndexedDB (not service-worker cache), a visible last-synced timestamp and
stale-data warning on every such view, storage scoped to the logged-in user
and cleared on logout, a retention/size limit, and a security review before
anything is stored — gated on separate approval.

## 6. Local development

```
npm start                       # CRA dev server (service worker is prod-only by design)
```
`src/setupProxy.js` already proxies `/api`, `/iis`, `/tenant`, `/auth-api`,
`/local-login` to the real backend per `.env` — no separate `server.js` needed
for local dev.

## 7. Production build

```
npm run build                   # emits build/, including build/icons/, build/offline.html, build/manifest.json
npx serve -s build -l <port>    # smoke-test the static output locally
```

## 8. Test report

Run with: `npm test -- --watchAll=false` and `npm run build`.

**Passed:**
- `npm run build` — succeeds, no new warnings beyond the pre-existing ESLint ones.
- `npm test` — 4 suites / 13 tests pass (manifest fields + icon files exist; `InstallPrompt` — shows on `beforeinstallprompt`, calls `.prompt()`, dismiss persists for the session, iOS hint when no native event, hidden when already standalone; `NetworkStatusBanner` — offline banner, transient "back online" banner; `App` smoke test renders the login screen through the real provider tree).
- Manifest + all 4 icons + `offline.html` return `200` when served from the production build (verified in a real Chromium browser via Playwright).
- Service worker registers and activates (verified live).
- Offline, with the precache intact (the realistic case): home page and an arbitrary app route both still render from the cached app shell; the `NetworkStatusBanner` correctly shows "You're offline"; a live `/api` fetch correctly **rejects** as a normal network error rather than resolving fakely; reconnecting and reloading restores normal operation. All verified live in Chromium.
- The `setCatchHandler`/`offline.html` code path itself, for the case where the app-shell precache entry is missing: verified correct via in-service-worker instrumentation (confirmed the fetch event fires, the catch handler runs, and the cache lookup for `offline.html` succeeds and would be returned) — see Known limitations for why this couldn't also be confirmed as a rendered page through this tool.
- No `/api`/`/auth-api`/`/tenant`/`/iis`/`/local-login` route is cache-serving (confirmed by code inspection of the compiled `service-worker.js`).

**Not tested** (not attempted, not claimed):
- Real iOS Safari install flow (no iOS device/simulator available here).
- Chrome on a real Android device.
- A live login against the real `atscmmes.usa.athenatec.com` AD/CMF backend (no real corporate credentials available in this environment).

## 9. Incidental fixes needed to get the test suite running

These were pre-existing toolchain gaps that blocked the test suite entirely
(discovered while fixing the default `App.test.tsx`), not PWA-specific, but
required to get any test importing `react-router-dom` to run at all under
this CRA 5 / react-router-dom 7 combination:
- `package.json` → `jest.moduleNameMapper`: `react-router-dom` and
  `react-router/dom` ship as ESM-first packages whose `package.json`
  `"exports"` map this older Jest resolver can't fully follow (one of them,
  `react-router-dom`, even has a broken `"main"` field pointing at a file
  that doesn't exist in the published package). Mapped both to their real,
  existing CJS files.
- `src/setupTests.ts`: added a `TextEncoder`/`TextDecoder` polyfill
  (`react-router`'s internals reference it; this jsdom version doesn't expose
  it) and a default `window.matchMedia` stub (jsdom doesn't implement it at
  all, and it's needed for any test that mounts `InstallPrompt`/`App`).

## 10. Installing the app

**Windows (Chrome/Edge):** open the site, click the install icon in the
address bar, or use the in-app "Install OneScan" banner.

**Android (Chrome):** the in-app banner's Install button triggers the native
install prompt, or use the browser menu → "Install app".

**iOS (Safari):** no native prompt exists on iOS — the in-app banner shows
"tap Share, then Add to Home Screen" instead.

## 11. Deployment

**Existing production path (unchanged):** on-prem IIS per `public/web.config`
— it reverse-proxies `/api`, `/iis`, `/tenant`, `/auth-api` to
`atscmmes.usa.athenatec.com`, and `/local-login` to a `server.js` process
running on `localhost:3001` on the same host. `service-worker.js` is already
configured there with `Cache-Control: no-cache` so update checks never see a
stale copy of the service worker itself.

**Free-tier cloud option**, if ever wanted (see earlier discussion in this
conversation for the full comparison): deploy the static `build/` output to
Vercel/Netlify/Render for free, and either run `server.js` as a small Node
service (Render's free web service needs no code changes) or port its
`/local-login` logic to a serverless function (Vercel/Netlify). This requires
the hosting provider's network to actually reach
`atscmmes.usa.athenatec.com` — confirm that isn't firewalled to
corporate/VPN IPs only before relying on it, and note real AD credentials
would then be flowing through a public, non-corporate-infra endpoint.

**External configuration still required for either path:** none beyond what
already exists (`.env` / `public/config.js`) — no new environment variables
were introduced by this work.

## 12. Known limitations / risks

- The `setCatchHandler`/`offline.html` fallback was verified correct via
  service-worker-level instrumentation, but a fully rendered confirmation of
  it in a live browser couldn't be obtained through Playwright: Chrome's CDP
  `Network.emulateNetworkConditions({offline:true})` (what `context.setOffline()`
  uses) can fail a top-level navigation at the browser level even when the
  service worker's `respondWith()` successfully resolves with a cached
  response — a documented quirk of that emulation mode, not something real
  users hit on a genuine lost connection. Manual verification (toggle your
  OS/router offline, not just DevTools' Offline checkbox) is the reliable way
  to see this rendered end-to-end.
- No offline read-only data — see §5.
- iOS install UX (the "tap Share" hint) is UA-sniffed, not tested on a real
  device.
