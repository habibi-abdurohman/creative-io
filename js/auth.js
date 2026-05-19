import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

export async function logoutUser() {
    try {
        await signOut(auth);
        const isPagesDir = window.location.pathname.includes('/pages/');
        window.location.replace(isPagesDir ? "../login.html" : "./login.html");
    } catch (error) {
        alert("Gagal logout: " + error.message);
    }
}
window.logoutUser = logoutUser;
