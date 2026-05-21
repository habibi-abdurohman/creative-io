// Deteksi path (aman untuk GitHub Pages)
const isInsidePagesFolder = window.location.pathname.includes('/pages/');
const swPath = isInsidePagesFolder ? '../service-worker.js' : './service-worker.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(swPath).catch(err => console.log('[PWA] SW Gagal:', err));
    });
}

// Menangkap Event Install PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Cegah browser memunculkan popup otomatis
    deferredPrompt = e; // Simpan event ke memori
    
    // Fungsi untuk memunculkan tombol di Sidebar
    const showInstallBtn = () => {
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) {
            installBtn.style.display = 'flex'; 
        } else {
            // Jika navbar belum selesai diload, coba lagi 0.5 detik kemudian
            setTimeout(showInstallBtn, 500);
        }
    };
    
    showInstallBtn();
});

// Fungsi ketika tombol Install ditekan
window.triggerPWAInstall = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('[PWA] User menginstal aplikasi');
        }
        deferredPrompt = null;
        
        // Sembunyikan tombol setelah diinstal
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) installBtn.style.display = 'none';
    } else {
        alert("Aplikasi sudah diinstal, atau browser Anda tidak mendukung fitur ini.");
    }
};
