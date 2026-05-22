// =========================================================
// PWA HANDLER - UPDATE TERBARU
// =========================================================

const isSubfolder = window.location.pathname.includes('/pages/');
const rootPrefix = isSubfolder ? '../' : './';

// 1. Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(rootPrefix + 'service-worker.js')
            .then(reg => console.log('SW Registered!', reg.scope))
            .catch(err => console.log('SW Failed!', err));
    });
}

// 2. Tangkap Event Install PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Cegah Chrome memunculkan mini-infobar otomatis
    e.preventDefault();
    // Simpan event untuk dipicu nanti
    deferredPrompt = e;

    // Munculkan container tombol install di sidebar
    const installContainer = document.getElementById('pwaInstallContainer');
    if (installContainer) {
        installContainer.style.display = 'block'; 
    }
});

// 3. Eksekusi Saat Tombol Install Ditekan
window.triggerPWAInstall = async () => {
    if (deferredPrompt) {
        // Munculkan prompt bawaan Chrome/Android
        deferredPrompt.prompt();
        
        // Tunggu respon user (Accept / Dismiss)
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User menginstal aplikasi');
            // Sembunyikan tombol setelah diinstall
            document.getElementById('pwaInstallContainer').style.display = 'none';
        }
        
        // Kosongkan prompt
        deferredPrompt = null;
    }
};

// 4. Deteksi jika aplikasi sudah terinstall
window.addEventListener('appinstalled', () => {
    const installContainer = document.getElementById('pwaInstallContainer');
    if (installContainer) installContainer.style.display = 'none';
    console.log('PWA berhasil diinstal');
});
