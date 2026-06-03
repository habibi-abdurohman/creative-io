import { auth } from './firebase.js';

const firebaseAuthUrl = "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail
} from firebaseAuthUrl;

export const loginUser = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential;
};

export const resetUserPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
    return await signOut(auth);
};

export const initAuthGuard = (onLoggedIn, onLoggedOut) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onLoggedIn(user);
        } else {
            onLoggedOut();
        }
    });
};