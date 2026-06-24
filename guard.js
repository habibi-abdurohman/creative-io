// File: js/guard.js
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const isInsidePagesFolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/collab/');
const rootPath = isInsidePagesFolder ? '../' : './';

const publicPages = ['index.html', 'login.html', 'register.html', 'forgot-password.html', ''];
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const isPublicPage = publicPages.includes(currentPage);

const USE_FIREBASE = true;

if (USE_FIREBASE) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // PERBAIKAN: Jika user sudah login, JANGAN biarkan masuk halaman autentikasi
            if (currentPage === 'login.html' || currentPage === 'register.html' || currentPage === 'forgot-password.html') {
                window.location.replace(rootPath + 'pages/dashboard.html');
            }
        } else {
            if (!isPublicPage) {
                window.location.replace(rootPath + 'login.html');
            }
        }
    });
}