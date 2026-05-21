/**
 * /js/auth.js
 * Pusat logika Autentikasi untuk Creative.io
 */

// Path import firebase.js menggunakan ./ karena auth.js dan firebase.js 
// berada di folder yang sama (/js/)
import { auth } from './firebase.js';

// Menggunakan versi CDN yang sama di seluruh project untuk konsistensi
const firebaseAuthUrl = "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail // Ditambahkan karena diperlukan untuk fitur lupa password
} from firebaseAuthUrl;

// Fungsi Login
export const loginUser = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

// Fungsi Daftar & Update Nama
export const registerUser = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential;
};

// Fungsi Reset Password
export const resetUserPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email);
};

// Fungsi Logout
export const logoutUser = async () => {
    return await signOut(auth);
};

// Fungsi Monitor Status Login (Auth Guard)
export const initAuthGuard = (onLoggedIn, onLoggedOut) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onLoggedIn(user);
        } else {
            onLoggedOut();
        }
    });
};
