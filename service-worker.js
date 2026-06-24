const CACHE_NAME = 'creative-io-v4';
const ASSETS = [
    'index.html',
    'login.html',
    'register.html',
    'forgot-password.html',
    'profil.html',
    'pages/dashboard.html',
    'pages/ideas.html',
    'pages/script.html',
    'pages/notes.html',
    'pages/calculator.html',
    'pages/trash.html',
    'collab/collab-hub.html',
    'assets/logo-192.png',
    'assets/logo-512.png',
    'js/firebase.js',
    'js/auth.js',
    'js/pwa.js',
    'navbar/navbar.css',
    'navbar/navbar.html',
    'navbar/navbar.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS.map(url => {
                    return cache.add(url).catch(err => console.warn('Gagal menyimpan cache:', url, err));
                })
            );
        })
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