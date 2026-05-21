let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah browser menampilkan prompt otomatis
    e.preventDefault();
    deferredPrompt = e;
    
    // Munculkan tombol install jika ada
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'flex';
});

window.triggerPWAInstall = () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User menerima instalasi PWA');
            }
            deferredPrompt = null;
        });
    }
};

// Registrasi Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Path disesuaikan agar selalu mengambil dari root
        const isPages = window.location.pathname.includes('/pages/');
        const swPath = isPages ? '../service-worker.js' : './service-worker.js';
        
        navigator.serviceWorker.register(swPath)
            .then(() => console.log("Service Worker terdaftar."))
            .catch((err) => console.log("Gagal registrasi SW:", err));
    });
}
