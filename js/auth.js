// file: /js/auth.js
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

// Export fungsi logout agar bisa dipanggil dari navbar atau tombol profil
export async function logoutUser() {
    try {
        await signOut(auth);
        // Setelah logout berhasil, arahkan ke login
        window.location.replace("../login.html");
    } catch (error) {
        console.error("Gagal logout:", error);
        alert("Terjadi kesalahan saat logout.");
    }
}

// Jadikan fungsi global agar bisa dipanggil langsung dari atribut onclick="" di HTML
window.logoutUser = logoutUser;
