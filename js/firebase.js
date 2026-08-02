import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
export const db = getFirestore(app);
export const persistenceReady = enableMultiTabIndexedDbPersistence(db)
  .then(() => true)
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn("Cache offline belum dapat diaktifkan karena sesi Firestore lain memakai mode persistence yang tidak kompatibel.");
      } else if (err.code == 'unimplemented') {
          console.warn("Browser ini tidak mendukung cache offline Firestore.");
      }
      return false;
  });
console.log("Firebase initialized successfully for GitHub Pages (Multi-tab Offline Cache Enabled)");
