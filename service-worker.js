const CACHE_NAME = 'creative-io-cache-v3';

// Daftar aset statis utama aplikasi yang aman dicache eksternal
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'login.html',
  'register.html',
  'forgot-password.html',
  'profil.html',
  'manifest.json',
  'navbar/navbar.html',
  'navbar/navbar.js',
  'navbar/navbar.css',
  'js/pwa.js',
  'pages/dashboard.html',
  'pages/notepad.html',
  'pages/notes.html',
  'pages/planner.html',
  'pages/calculator.html',
  'pages/trash.html'
];

// Tahap Install: Memasukkan aset statis ke dalam cache offline browser
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Tahap Aktivasi: Membersihkan cache versi lama jika ada pembaruan kode PWA
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus Cache Lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Tahap Fetch: Strategi Cache First - Network Fallback dengan proteksi Firebase Auth
self.addEventListener('fetch', (event) => {
  // KEAMANAN KRUSIAL: Jangan pernah intercept request ke server Firebase (identitytoolkit / firestore)
  if (
    event.request.url.includes('firebase') || 
    event.request.url.includes('googleapis') ||
    event.request.method !== 'GET'
  ) {
    return; // Biarkan request langsung dikirim lewat jaringan internet normal
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Ambil dari cache, tapi lakukan fetch di background untuk memperbarui cache secara diam-diam
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Abaikan error network offline di latar belakang */});
        
        return cachedResponse;
      }

      // Jika aset belum terdaftar di cache shell, ambil dari jaringan internet
      return fetch(event.request).catch(() => {
        // Jika internet mati total dan halaman tidak ketemu di cache, arahkan ke offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
