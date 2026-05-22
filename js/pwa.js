// =========================================================
// PWA HANDLER - FIX RACE CONDITION
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

// 2. Variabel Global untuk menyimpan Event
window.deferredPrompt = null;

// 3. Tangkap Event Install PWA
window.addEventListener('beforeinstallprompt', (e) => {
    // Cegah Chrome memunculkan mini-infobar otomatis
    e.preventDefault();
    // Simpan event ke variabel global
    window.deferredPrompt = e;
    console.log("PWA: Status Installable Terdeteksi!");

    // Coba munculkan tombol (jika navbar sudah ada)
    showPwaButton();
});

// 4. Fungsi untuk memunculkan tombol (Bisa dipanggil dari luar)
window.showPwaButton = function() {
    const installContainer = document.getElementById('pwaInstallContainer');
    // Jika event PWA ada DAN navbar sudah selesai di-load
    if (window.deferredPrompt && installContainer) {
        installContainer.style.display = 'block';
        console.log("PWA: Tombol Install Dimunculkan");
    }
};

// 5. Eksekusi Saat Tombol Install Ditekan
window.triggerPWAInstall = async () => {
    if (window.deferredPrompt) {
        // Munculkan prompt bawaan Chrome/Android
        window.deferredPrompt.prompt();
        
        // Tunggu respon user (Accept / Dismiss)
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('PWA: User menginstal aplikasi');
            document.getElementById('pwaInstallContainer').style.display = 'none';
        }
        
        // Kosongkan prompt setelah dipakai
        window.deferredPrompt = null;
    }
};

// 6. Deteksi jika aplikasi sudah terinstall
window.addEventListener('appinstalled', () => {
    const installContainer = document.getElementById('pwaInstallContainer');
    if (installContainer) installContainer.style.display = 'none';
    console.log('PWA: Berhasil diinstal / Sudah terinstal');
});
