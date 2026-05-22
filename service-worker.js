const CACHE_NAME = 'creative-io-v2'; // Naik versi untuk bypass cache lama
// Menggunakan relative path agar lolos saat dideploy ke GitHub Pages (/repo-name/)
const ASSETS = [
    './',
    './index.html',
    './login.html',
    './assets/logo.png',
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
    // Abaikan cache untuk request ke API eksternal/Firebase
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Fallback offline (Bisa diarahkan ke custom offline page jika ada)
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
