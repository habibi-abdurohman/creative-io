import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Cek apakah file berada di dalam folder 'pages'
        const isPagesDir = window.location.pathname.includes('/pages/');
        const loginPath = isPagesDir ? "../login.html" : "./login.html";
        window.location.replace(loginPath);
    }
});
