const CACHE_NAME = 'creative-io-v16';
const MUSIC_STREAM_PREFIX = new URL(self.registration.scope).pathname.replace(/\/?$/, '/') + '__creative_music_stream__/';
const musicStreamEntries = new Map();
const MAX_MUSIC_STREAM_ENTRIES = 40;
const ASSETS = [
    'index.html',
    'app.html',
    'login.html',
    'register.html',
    'forgot-password.html',
    'profil.html',
    'pages/dashboard.html',
    'pages/ideas.html',
    'pages/script.html',
    'pages/notes.html',
    'pages/career.html',
    'pages/music.html',
    'pages/calculator.html',
    'pages/trash.html',
    'collab/collab-hub.html',
    'assets/logo-192.png',
    'assets/logo-512.png',
    'js/firebase.js',
    'js/auth.js',
    'js/career.js',
    'js/pwa.js',
    'navbar/navbar.css',
    'navbar/navbar.html',
    'navbar/navbar.js'
];
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
    const streamKey = decodeURIComponent(url.pathname.slice(MUSIC_STREAM_PREFIX.length)).split('/')[0];
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
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then((cache) => {
                return Promise.all(
                    ASSETS.map(url => {
                        return cache.add(url).catch(err => console.warn('Gagal menyimpan cache:', url, err));
                    })
                );
            }),
            self.skipWaiting()
        ])
    );
});
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(keys => {
                return Promise.all(
                    keys.map(key => {
                        if (key !== CACHE_NAME) return caches.delete(key);
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin === self.location.origin && requestUrl.pathname.startsWith(MUSIC_STREAM_PREFIX)) {
        event.respondWith(streamDriveMusic(event, requestUrl));
        return;
    }
    if (!event.request.url.startsWith(self.location.origin)) return;
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('index.html');
                }
            });
        })
    );
});
