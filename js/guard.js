// file: /js/guard.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Jika tidak ada user/belum login, tendang ke login.html
        // Pastikan path-nya benar. Jika guard.js dipanggil dari folder /pages/, 
        // maka naiknya pakai '../'
        window.location.replace("../login.html");
    }
});
