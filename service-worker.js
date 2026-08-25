const CACHE_PREFIX = 'creative-io-static-';
const CACHE_NAME = CACHE_PREFIX + 'v25';
const NAVIGATION_FETCH_TIMEOUT_MS = 8000;
const PRECACHE_FETCH_TIMEOUT_MS = 15000;
const SCOPE_URL = new URL(self.registration.scope);
const MUSIC_STREAM_PREFIX = new URL(self.registration.scope).pathname.replace(/\/?$/, '/') + '__creative_music_stream__/';
const musicStreamEntries = new Map();
const MAX_MUSIC_STREAM_ENTRIES = 40;
const CORE_ASSETS = [
  'index.html',
  'app.html',
  'login.html',
  'manifest.json',
  'assets/favicon-192x192.png',
  'assets/logo-192.png',
  'assets/logo-512.png',
  'js/firebase.js',
  'js/auth.js',
  'js/pwa.js',
  'navbar/navbar.css',
  'navbar/navbar.html',
  'navbar/navbar.js'
];
const OPTIONAL_ASSETS = [
  'register.html',
  'forgot-password.html',
  'profil.html',
  'pages/dashboard.html',
  'pages/ideas.html',
  'pages/script.html',
  'pages/notes.html',
  'pages/career.html',
  'pages/music.html',
  'pages/video-lens-extractor.html',
  'pages/wallet.html',
  'pages/calculator.html',
  'pages/trash.html',
  'pages/todolist.html',
  'collab/collab-hub.html',
  'collab/collab-script.html',
  'collab/collab-notes.html',
  'collab/collab-ideas.html',
  'js/career.js'
];
const PRECACHE_ASSETS = [...CORE_ASSETS, ...OPTIONAL_ASSETS];
const scopedUrl = (path) => new URL(path, SCOPE_URL).href;
const PRECACHE_PATHS = new Set(
  PRECACHE_ASSETS.map((path) => new URL(scopedUrl(path)).pathname)
);
const OFFLINE_FALLBACK_URL = scopedUrl('index.html');
function cacheKeyFor(request) {
  const url = new URL(typeof request === 'string' ? request : request.url);
  if (PRECACHE_PATHS.has(url.pathname)) {
    url.search = '';
    url.hash = '';
    return url.href;
  }
  return request;
}
function isCacheableResponse(response) {
  if (!response || !response.ok || response.status !== 200) return false;
  if (!['basic', 'default'].includes(response.type)) return false;
  const cacheControl = response.headers.get('Cache-Control') || '';
  return !/(?:^|,)\s*(?:no-store|private)\b/i.test(cacheControl);
}
async function fetchCompleteResponseWithTimeout(request, timeoutMs) {
  if (typeof AbortController === 'undefined') {
    let timeoutId = 0;
    const timeoutPromise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error('Batas waktu permintaan terlampaui.')),
        timeoutMs
      );
    });
    try {
      const response = await Promise.race([
        fetch(request),
        timeoutPromise
      ]);
      await Promise.race([
        response.clone().arrayBuffer(),
        timeoutPromise
      ]);
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    timeoutMs
  );
  try {
    const response = await fetch(request, {
      signal: controller.signal
    });
    await response.clone().arrayBuffer();
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
async function fetchAndCache(cache, url, required) {
  try {
    const request = new Request(url, {
      cache: 'reload',
      credentials: 'same-origin'
    });
    const response = await fetchCompleteResponseWithTimeout(
      request,
      PRECACHE_FETCH_TIMEOUT_MS
    );
    if (!isCacheableResponse(response)) {
      throw new Error('Respons tidak dapat disimpan (' + response.status + ').');
    }
    await cache.put(cacheKeyFor(request), response);
  } catch (error) {
    if (required) throw error;
    console.warn('PWA: Aset opsional tidak dapat dipra-cache:', url, error);
  }
}
async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(CORE_ASSETS.map((path) => fetchAndCache(cache, scopedUrl(path), true)));
  await Promise.all(OPTIONAL_ASSETS.map((path) => fetchAndCache(cache, scopedUrl(path), false)));
}
function replyToMessage(event, payload) {
  const port = event.ports && event.ports[0];
  if (port) port.postMessage(payload);
}
async function notifyMusicClient(clientId, payload) {
  if (!clientId) return;
  const client = await self.clients.get(clientId);
  if (client) client.postMessage(payload);
}
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'PWA_ACTIVATE_UPDATE') {
    event.waitUntil(self.skipWaiting());
    replyToMessage(event, { ok: true });
    return;
  }
  if (data.type === 'MUSIC_CLAIM_CLIENTS') {
    event.waitUntil(self.clients.claim().then(() => replyToMessage(event, { ok: true })));
    return;
  }
  if (data.type === 'MUSIC_DRIVE_STREAM_CLEAR') {
    const clientId = event.source && event.source.id;
    for (const [key, entry] of musicStreamEntries) {
      if (!clientId || entry.clientId === clientId) musicStreamEntries.delete(key);
    }
    replyToMessage(event, { ok: true });
    return;
  }
  if (data.type !== 'MUSIC_DRIVE_STREAM_PRIME') return;
  const streamKey = String(data.streamKey || '');
  const file = data.file || {};
  const accessToken = String(data.accessToken || '');
  if (!/^[a-zA-Z0-9-]{16,}$/.test(streamKey) || !file.id || !accessToken) {
    replyToMessage(event, { ok: false, error: 'STREAM_DATA_INVALID' });
    return;
  }
  const now = Date.now();
  for (const [key, entry] of musicStreamEntries) {
    if (entry.expiresAt && entry.expiresAt <= now) musicStreamEntries.delete(key);
  }
  musicStreamEntries.set(streamKey, {
    clientId: event.source && event.source.id || '',
    accessToken,
    expiresAt: Number(data.expiresAt || 0),
    file: {
      id: String(file.id),
      resourceKey: String(file.resourceKey || ''),
      mimeType: String(file.mimeType || 'audio/mpeg'),
      size: Number(file.size || 0)
    }
  });
  while (musicStreamEntries.size > MAX_MUSIC_STREAM_ENTRIES) {
    musicStreamEntries.delete(musicStreamEntries.keys().next().value);
  }
  replyToMessage(event, { ok: true });
});
function copyMusicResponseHeaders(upstream, entry, requestRange) {
  const headers = new Headers();
  ['Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges', 'ETag', 'Last-Modified'].forEach((name) => {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  });
  if (!headers.has('Content-Type')) headers.set('Content-Type', entry.file.mimeType || 'audio/mpeg');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  if (upstream.status === 206 && !headers.has('Content-Range') && entry.file.size && requestRange) {
    const match = /^bytes=(\d+)-(\d*)$/i.exec(requestRange);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Math.min(Number(match[2]), entry.file.size - 1) : entry.file.size - 1;
      if (end >= start) {
        headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + entry.file.size);
        headers.set('Content-Length', String(end - start + 1));
      }
    }
  }
  return headers;
}
async function streamDriveMusic(event, url) {
  let streamKey = '';
  try {
    streamKey = decodeURIComponent(url.pathname.slice(MUSIC_STREAM_PREFIX.length)).split('/')[0];
  } catch {
    return new Response('Alamat streaming tidak valid.', {
      status: 400,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
  const entry = musicStreamEntries.get(streamKey);
  if (!entry) {
    await notifyMusicClient(event.clientId, { type: 'MUSIC_DRIVE_STREAM_ERROR', reason: 'SESSION_MISSING' });
    return new Response('Sesi streaming perlu disiapkan ulang.', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  if (entry.clientId && event.clientId && entry.clientId !== event.clientId) {
    return new Response('Sesi streaming tidak cocok dengan halaman ini.', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    musicStreamEntries.delete(streamKey);
    await notifyMusicClient(entry.clientId || event.clientId, { type: 'MUSIC_DRIVE_STREAM_ERROR', reason: 'AUTH_EXPIRED', status: 401 });
    return new Response('Sesi Google Drive telah berakhir.', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const params = new URLSearchParams({ alt: 'media', supportsAllDrives: 'true' });
  const driveUrl = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(entry.file.id) + '?' + params.toString();
  const requestRange = event.request.headers.get('Range') || '';
  const headers = new Headers({ Authorization: 'Bearer ' + entry.accessToken });
  if (requestRange) headers.set('Range', requestRange);
  if (entry.file.resourceKey) headers.set('X-Goog-Drive-Resource-Keys', entry.file.id + '/' + entry.file.resourceKey);
  try {
    const upstream = await fetch(driveUrl, { headers, cache: 'no-store' });
    if (upstream.status === 401) {
      musicStreamEntries.delete(streamKey);
      await notifyMusicClient(entry.clientId || event.clientId, { type: 'MUSIC_DRIVE_STREAM_ERROR', reason: 'AUTH_EXPIRED', status: 401 });
    } else if (!upstream.ok && upstream.status !== 206 && upstream.status !== 416) {
      await notifyMusicClient(entry.clientId || event.clientId, { type: 'MUSIC_DRIVE_STREAM_ERROR', reason: 'DRIVE_ERROR', status: upstream.status });
    }
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: copyMusicResponseHeaders(upstream, entry, requestRange)
    });
  } catch (error) {
    await notifyMusicClient(entry.clientId || event.clientId, { type: 'MUSIC_DRIVE_STREAM_ERROR', reason: 'NETWORK_ERROR' });
    return new Response('Streaming Google Drive tidak tersedia.', { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell());
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return false;
          })
        );
      }),
      self.clients.claim()
    ])
  );
});
async function fetchNavigationWithTimeout(request) {
  return fetchCompleteResponseWithTimeout(
    request,
    NAVIGATION_FETCH_TIMEOUT_MS
  );
}
function networkFirstNavigation(event) {
  const request = event.request;
  const cachePromise = caches.open(CACHE_NAME);
  const networkPromise = fetchNavigationWithTimeout(request);
  event.waitUntil(
    networkPromise
      .then(async response => {
        if (!isCacheableResponse(response)) return;
        const cache = await cachePromise;
        await cache.put(cacheKeyFor(request), response.clone());
      })
      .catch(error => {
        console.warn('PWA: Navigasi tidak dapat diperbarui di cache.', error);
      })
  );
  return networkPromise.catch(async () => {
    const cache = await cachePromise;
    const cachedPage = await cache.match(cacheKeyFor(request));
    if (cachedPage) return cachedPage;
    const fallback = await cache.match(OFFLINE_FALLBACK_URL);
    if (fallback) return fallback;
    return new Response('Creative.io sedang offline dan halaman ini belum tersimpan.', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  });
}
async function networkFirstNavbarAsset(event) {
  const request = event.request;
  const cacheKey = cacheKeyFor(request);
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      await cache.put(cacheKey, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
function staleWhileRevalidate(event) {
  const request = event.request;
  const cacheKey = cacheKeyFor(request);
  const cachePromise = caches.open(CACHE_NAME);
  const cachedResponsePromise = cachePromise.then((cache) => cache.match(cacheKey));
  const networkResponsePromise = fetch(request).then(async (response) => {
    if (isCacheableResponse(response)) {
      const cache = await cachePromise;
      await cache.put(cacheKey, response.clone());
    }
    return response;
  });
  event.waitUntil(networkResponsePromise.then(() => undefined).catch(() => undefined));
  return cachedResponsePromise.then((cachedResponse) => cachedResponse || networkResponsePromise);
}
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const navbarJsPath = new URL(scopedUrl('navbar/navbar.js')).pathname;
  const navbarHtmlPath = new URL(scopedUrl('navbar/navbar.html')).pathname;
  if (
    requestUrl.origin === self.location.origin &&
    (requestUrl.pathname === navbarJsPath || requestUrl.pathname === navbarHtmlPath)
  ) {
    event.respondWith(networkFirstNavbarAsset(event));
    return;
  }
  if (
    requestUrl.origin === self.location.origin &&
    requestUrl.pathname.startsWith(MUSIC_STREAM_PREFIX)
  ) {
    event.respondWith(streamDriveMusic(event, requestUrl));
    return;
  }
  if (requestUrl.origin !== self.location.origin || event.request.method !== 'GET') {
    return;
  }
  if (event.request.headers.has('Range')) {
    return;
  }
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event));
    return;
  }
  const staticDestinations = new Set(['style', 'script', 'image', 'font', 'manifest']);
  const isPrecachedPath = PRECACHE_PATHS.has(requestUrl.pathname);
  if (!isPrecachedPath && !staticDestinations.has(event.request.destination)) {
    return;
  }
  event.respondWith(staleWhileRevalidate(event));
});
