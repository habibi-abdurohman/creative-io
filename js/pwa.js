const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/collab/');
const rootPrefix = isSubfolder ? '../' : './';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(rootPrefix + 'service-worker.js')
            .then(reg => console.log('SW Registered!', reg.scope))
            .catch(err => console.log('SW Failed!', err));
    });
}

window.deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    alert("SYSTEM: PWA Siap Diinstal di HP Anda!");
    
    console.log("PWA: Status Installable Terdeteksi!");
    showPwaButton();
});

window.showPwaButton = function() {
    const installContainer = document.getElementById('pwaInstallContainer');
    if (window.deferredPrompt && installContainer) {
        installContainer.style.display = 'block';
        console.log("PWA: Tombol Install Dimunculkan");
    }
};

window.triggerPWAInstall = async () => {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('PWA: User menginstal aplikasi');
            document.getElementById('pwaInstallContainer').style.display = 'none';
        }
        
        window.deferredPrompt = null;
    }
};

window.addEventListener('appinstalled', () => {
    const installContainer = document.getElementById('pwaInstallContainer');
    if (installContainer) installContainer.style.display = 'none';
    console.log('PWA: Berhasil diinstal / Sudah terinstal');
});
