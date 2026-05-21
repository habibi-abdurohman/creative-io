// File: js/guard.js
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 1. Deteksi cerdas apakah user berada di dalam sub-folder /pages/
// Ini sangat penting agar redirect ke rootPath atau sub-folder selalu akurat di GitHub Pages
const isInsidePagesFolder = window.location.pathname.includes('/pages/');
const rootPath = isInsidePagesFolder ? '../' : './';

// 2. Daftar halaman publik yang tidak memerlukan autentikasi
const publicPages = ['index.html', 'login.html', 'register.html', 'forgot-password.html'];
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const isPublicPage = publicPages.includes(currentPage);

// 3. Sakelar Hybrid (Pastikan konsisten dengan file HTML Anda)
const USE_FIREBASE = true;

// 4. Logika Guard Utama
if (USE_FIREBASE) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Jika user sudah login dan sedang di halaman publik (selain index.html), 
            // arahkan ke dashboard.
            if (isPublicPage && currentPage !== 'index.html') {
                window.location.replace(rootPath + 'pages/dashboard.html');
            }
        } else {
            // Jika user belum login dan mencoba mengakses halaman privat (bukan halaman publik),
            // arahkan kembali ke halaman login.
            if (!isPublicPage) {
                // Pastikan path login.html konsisten dengan posisi user
                window.location.replace(rootPath + 'login.html');
            }
        }
    });
} else {
    // Mode LOKAL (Mode Testing/Tanpa Firebase)
    const isLocalLoggedIn = localStorage.getItem('dummy_logged_in') === 'true';
    if (isLocalLoggedIn) {
        if (isPublicPage && currentPage !== 'index.html') {
            window.location.replace(rootPath + 'pages/dashboard.html');
        }
    } else {
        if (!isPublicPage) {
            window.location.replace(rootPath + 'login.html');
        }
    }
}
