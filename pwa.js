const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/collab/');
const rootPrefix = isSubfolder ? '../' : './';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(rootPrefix + 'service-worker.js')
            .then(reg => console.log('PWA: Service Worker Berhasil Didaftarkan!', reg.scope))
            .catch(err => console.error('PWA: Service Worker Gagal!', err));
    });
}

window.deferredPrompt = null;

function isAppStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

window.showPwaButton = function() {
    const installContainer = document.getElementById('pwaInstallContainer');
    const installBtn = document.getElementById('pwaInstallBtn');
    
    if (!installContainer) return; // Keluar jika HTML Navbar belum selesai di-download

    if (isAppStandalone()) {
        installContainer.style.display = 'none';
        console.log("PWA: Aplikasi berjalan dalam mode Standalone. Tombol disembunyikan.");
        return;
    }

    if (window.deferredPrompt) {
        installContainer.style.display = 'block';
        if (installBtn) installBtn.innerHTML = '<span class="icon">📱</span> Install App';
        console.log("PWA: Lampu hijau browser terdeteksi. Tombol ditampilkan.");
        return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !isAppStandalone()) {
        installContainer.style.display = 'block';
        if (installBtn) {
            installBtn.innerHTML = '<span class="icon">ℹ️</span> Cara Install';

            window.triggerPWAInstall = () => {
                alert("Untuk menginstal di iPhone/iPad:\n1. Tekan tombol 'Share' (Bagikan) di bagian bawah Safari.\n2. Pilih 'Add to Home Screen' (Tambahkan ke Layar Utama).");
            };
        }
        console.log("PWA: Perangkat iOS terdeteksi. Menampilkan panduan manual.");
    }
};

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    
    window.deferredPrompt = e;
    
    console.log("PWA: Browser menyatakan website ini LAYAK diinstal.");
    
    window.showPwaButton();
});

window.triggerPWAInstall = async () => {
    if (window.deferredPrompt) {
        
        window.deferredPrompt.prompt();
        
        const { outcome } = await window.deferredPrompt.userChoice;
        console.log(`PWA: Keputusan pengguna -> ${outcome}`);
        
        window.deferredPrompt = null;
        
        const installContainer = document.getElementById('pwaInstallContainer');
        if (installContainer) installContainer.style.display = 'none';
    }
};

window.addEventListener('appinstalled', () => {
    console.log('PWA: Aplikasi BERHASIL diinstal ke perangkat!');
    
    const installContainer = document.getElementById('pwaInstallContainer');
    if (installContainer) {
        installContainer.style.display = 'none';
    }
    
    window.deferredPrompt = null;
});
