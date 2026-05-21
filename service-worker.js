const CACHE_NAME = 'creative-io-v1';
const ASSETS = [
    './',
    './index.html',
    './login.html',
    './assets/logo.png',
    './js/firebase.js',
    './js/auth.js',
    './js/guard.js',
    './js/pwa.js',
    './navbar/navbar.css',
    './navbar/navbar.html',
    './navbar/navbar.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
