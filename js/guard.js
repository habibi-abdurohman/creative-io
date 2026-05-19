import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Tunggu sampai Firebase selesai mengecek memori session browser
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Jika tidak ada user (belum login), lempar ke login.html
        // Gunakan ../ karena guard.js biasanya dipanggil dari dalam folder /pages/
        window.location.replace("../login.html");
    }
});
