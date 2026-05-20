// File: js/auth.js
import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Deteksi root path untuk redirect setelah logout
const isInsidePagesFolder = window.location.pathname.includes('/pages/');
const rootPath = isInsidePagesFolder ? '../' : './';

const USE_FIREBASE = true;

export async function logoutUser() {
    // Tampilkan konfirmasi ramah
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar dari workspace?");
    if (!confirmLogout) return;

    if (USE_FIREBASE) {
        try {
            await signOut(auth);
            // Hapus sisa data lokal (opsional untuk keamanan)
            localStorage.removeItem('dummy_logged_in'); 
            window.location.replace(rootPath + 'login.html');
        } catch (error) {
            alert("Gagal keluar: " + error.message);
        }
    } else {
        // Mode Lokal
        localStorage.removeItem('dummy_logged_in');
        window.location.replace(rootPath + 'login.html');
    }
}

// Jadikan fungsi global agar bisa dipanggil langsung dari onclick="" di HTML
window.globalLogout = logoutUser;
