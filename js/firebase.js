// Import fungsi yang diperlukan dari Firebase SDK (CDN version 10.12.2)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================================================
// KONFIGURASI FIREBASE
// Ganti dengan data asli dari project Firebase Anda
// =========================================================
const firebaseConfig = {
    apiKey: "AIzaSyBqaKkmY0LnNSBbQRA20h3ruLUMruVLx_g",
    authDomain: "creative-io-workspace.firebaseapp.com",
    projectId: "creative-io-workspace",
    storageBucket: "creative-io-workspace.firebasestorage.app",
    messagingSenderId: "11798782872",
    appId: "1:11798782872:web:84768cdba8425d109041ed"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Menambahkan pengecekan konsol untuk memastikan modul dimuat dengan benar
console.log("Firebase initialized successfully for GitHub Pages");
