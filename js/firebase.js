import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    initializeFirestore, doc, onSnapshot, terminate,
    persistentLocalCache,
    persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyBqaKkmY0LnNSBbQRA20h3ruLUMruVLx_g",
    authDomain: "creative-io-workspace.firebaseapp.com",
    projectId: "creative-io-workspace",
    storageBucket: "creative-io-workspace.firebasestorage.app",
    messagingSenderId: "11798782872",
    appId: "1:11798782872:web:84768cdba8425d109041ed"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
export const persistenceReady = Promise.resolve(true);
console.log("Firebase initialized successfully (Persistent multi-tab cache enabled)");
let stopDeletionWatch = () => {};
onAuthStateChanged(auth, user => {
    stopDeletionWatch();
    if (!user) return;
    stopDeletionWatch = onSnapshot(doc(db, 'users', user.uid), snapshot => {
        if (snapshot.data()?.accountDeletion !== true) return;
        stopDeletionWatch();
        window.creativeAccountDeletionPending = true;
        window.dispatchEvent(new Event('creative-account-deletion'));
        if (!window.creativeAccountDeletionActive) {
            terminate(db).catch(console.error);
            if (!location.pathname.endsWith('/profil.html')) location.replace(new URL('../profil.html', import.meta.url).href);
        }
    }, error => console.warn('Status penghapusan belum dapat diperiksa:', error.code));
});