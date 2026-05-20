// File: js/pwa.js

// Deteksi path secara otomatis agar manifest & service worker tidak error 404
const isInsidePagesFolder = window.location.pathname.includes('/pages/');
const swPath = isInsidePagesFolder ? '../service-worker.js' : './service-worker.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(swPath)
            .then((registration) => {
                console.log('[PWA] Service Worker berhasil terdaftar dengan scope:', registration.scope);
            })
            .catch((error) => {
                console.error('[PWA] Registrasi Service Worker gagal:', error);
            });
    });
}
