// File: js/guard.js
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Deteksi cerdas apakah user sedang berada di folder /pages/ atau di root
const isInsidePagesFolder = window.location.pathname.includes('/pages/');
const rootPath = isInsidePagesFolder ? '../' : './';

// Tentukan apakah halaman saat ini adalah halaman publik (bebas akses)
const publicPages = ['index.html', 'login.html', 'register.html', 'forgot-password.html'];
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const isPublicPage = publicPages.includes(currentPage);

// Sakelar Hybrid (Pastikan sama dengan yang ada di HTML)
const USE_FIREBASE = true;

if (USE_FIREBASE) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Jika sudah login dan mencoba buka halaman login/register, tendang ke dashboard
            if (isPublicPage && currentPage !== 'index.html') {
                window.location.replace(rootPath + 'pages/dashboard.html');
            }
        } else {
            // Jika belum login tapi mencoba buka halaman dalam (dashboard/tools), tendang ke login
            if (!isPublicPage) {
                window.location.replace(rootPath + 'login.html');
            }
        }
    });
} else {
    // Mode LOKAL (Tanpa Internet/Firebase)
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
