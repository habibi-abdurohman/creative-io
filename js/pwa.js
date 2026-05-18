// file: /js/pwa.js

let deferredPrompt;

// 1. Registrasi Service Worker ke dalam sistem browser
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => console.log('[PWA] Service Worker sukses terdaftar!', reg.scope))
      .catch((err) => console.error('[PWA] Registrasi SW gagal:', err));
  });
}

// 2. Mendengarkan event instalasi dari sistem operasi browser
window.addEventListener('beforeinstallprompt', (e) => {
  // Cegah browser menampilkan prompt bawaan yang kaku secara otomatis
  e.preventDefault();
  // Simpan event ke memori agar bisa dipicu manual lewat tombol UI
  deferredPrompt = e;
  
  // Tampilkan tombol "Install App" di UI (misalnya tombol di dalam sidebar atau navbar)
  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) {
    installBtn.style.display = 'flex'; // Munculkan tombol jika PWA didukung browser
  }
});

// 3. Fungsi eksekusi saat user menekan tombol install di UI
window.triggerPWAInstall = function() {
  if (!deferredPrompt) return;
  
  // Munculkan dialog instalasi resmi sistem operasi
  deferredPrompt.prompt();
  
  // Baca respon dari klik pilihan user
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] Pengguna menyetujui instalasi Creative.io');
    } else {
      console.log('[PWA] Pengguna menolak instalasi');
    }
    // Hapus prompt karena hanya bisa digunakan satu kali
    deferredPrompt = null;
    
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) installBtn.style.display = 'none';
  });
};

// 4. Deteksi apakah aplikasi dijalankan dalam mode Standalone (Sudah Terinstal)
window.addEventListener('DOMContentLoaded', () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) {
    console.log('[PWA] Berjalan dalam mode aplikasi standalone.');
    // Sembunyikan tombol install di UI jika user sudah telanjur menginstalnya
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) installBtn.style.display = 'none';
  }
});
