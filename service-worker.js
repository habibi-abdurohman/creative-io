const CACHE_NAME = 'creative-io-cache-v1';

// Daftar file inti yang akan disimpan di memori perangkat (Cache)
// Gunakan path relatif agar aman di GitHub Pages
const urlsToCache = [
    './',
    './index.html',
    './login.html',
    './manifest.json',
    './navbar/navbar.css',
    './navbar/navbar.js',
    './js/pwa.js',
    './js/auth.js',
    './js/guard.js',
    './assets/logo.png'
];

// EVENT 1: INSTALL (Menyimpan file ke Cache saat pertama kali web dibuka)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[PWA] Membuka cache dan menyimpan aset inti...');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// EVENT 2: ACTIVATE (Membersihkan Cache lama jika ada pembaruan versi)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[PWA] Membersihkan cache lama:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// EVENT 3: FETCH (Strategi Cache First, fall back to Network)
// Saat user pindah halaman, cek apakah file ada di cache. Jika ada, pakai itu agar cepat. Jika tidak, ambil dari internet.
self.addEventListener('fetch', (event) => {
    // Abaikan request dari ekstensi chrome atau skema yang tidak didukung
    if (!(event.request.url.indexOf('http') === 0)) return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return data dari cache jika ada
                if (response) {
                    return response;
                }
                // Jika tidak ada di cache, ambil dari internet
                return fetch(event.request).then(
                    (networkResponse) => {
                        // Jangan cache jika response tidak valid atau jika request ke Firebase/API eksternal
                        if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Simpan file baru ke cache untuk penggunaan berikutnya
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                );
            })
    );
});
