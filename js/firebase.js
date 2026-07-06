import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

enableIndexedDbPersistence(db)
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn("Fitur hemat kuota dimatikan karena membuka banyak tab aplikasi secara bersamaan.");
      } else if (err.code == 'unimplemented') {
          console.warn("Browser ini tidak mendukung fitur hemat kuota (cache memory).");
      }
  });

console.log("Firebase initialized successfully for GitHub Pages (Offline Cache Enabled)");
