/**
 * /js/auth.js
 * Pusat logika Autentikasi untuk Creative.io
 */

import { auth } from './firebase.js';

// KOREKSI: Gunakan string literal langsung pada baris import dari CDN
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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