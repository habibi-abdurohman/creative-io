const CACHE_NAME = 'creative-io-v3';
const ASSETS = [
    './',
    './index.html',
    './login.html',
    './assets/logo-192.png', // Diperbaiki dari logo.png
    './assets/logo-512.png', // Tambahkan juga ini
    './js/firebase.js',
    './js/pwa.js',
    './navbar/navbar.css',
    './navbar/navbar.html',
    './navbar/navbar.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
