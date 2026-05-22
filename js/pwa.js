// =========================================================
// PWA HANDLER - INSTALL PROMPT & SW REGISTRATION
// =========================================================

// Tentukan root path berdasarkan folder saat ini
const isSubfolder = window.location.pathname.includes('/pages/');
const rootPrefix = isSubfolder ? '../' : './';

// 1. Registrasi Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(rootPrefix + 'service-worker.js')
            .then((registration) => {
                console.log('SW Registered scope:', registration.scope);
            })
            .catch((error) => {
                console.log('SW Registration failed:', error);
            });
    });
}

// 2. Handle Custom Install Prompt (PWA Installable)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah mini-infobar muncul otomatis di mobile
    e.preventDefault();
    deferredPrompt = e;

    // Munculkan tombol di Sidebar (Terdapat di navbar.html)
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.style.display = 'flex';
    }
});

// Dipanggil saat tombol ditekan
window.triggerPWAInstall = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted PWA install');
            document.getElementById('pwaInstallBtn').style.display = 'none';
        }
        deferredPrompt = null;
    }
};

window.addEventListener('appinstalled', () => {
    document.getElementById('pwaInstallBtn').style.display = 'none';
    console.log('PWA was installed');
});
