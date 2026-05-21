// =========================================================
// 1. AUTO-ROUTING (CEGAH ERROR 404 DI GITHUB PAGES)
// =========================================================
const isInsidePagesFolder = window.location.pathname.includes('/pages/');
const rootPath = isInsidePagesFolder ? '../' : './';

// =========================================================
// 2. FETCH & RENDER NAVBAR HTML
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) return;

    fetch(rootPath + "navbar/navbar.html")
        .then(response => {
            if (!response.ok) throw new Error("Navbar HTML tidak ditemukan.");
            return response.text();
        })
        .then(html => {
            const processedHtml = html
                .replace(/href="pages\//g, `href="${rootPath}pages/`)
                .replace(/href="profil.html"/g, `href="${rootPath}profil.html"`);
                
            navbarContainer.innerHTML = processedHtml;
            initNavbarUI(); 
        })
        .catch(error => console.error("Error memuat navbar:", error));
});

// =========================================================
// 3. INISIALISASI FITUR NAVBAR UI
// =========================================================
function initNavbarUI() {
    loadTheme();
    setActiveMenu();

    // Tutup dropdown jika klik di luar
    window.addEventListener("click", function(e) {
        const profile = document.querySelector(".profile-wrap");
        const dropdown = document.getElementById("profileDropdown");
        if (profile && !profile.contains(e.target)) {
            dropdown?.classList.remove("active");
        }
    });
}

// =========================================================
// 4. KENDALI SIDEBAR & TEMA
// =========================================================
window.toggleTheme = function() {
    document.body.classList.toggle("dark");
    localStorage.setItem("dashboard_theme", document.body.classList.contains("dark") ? "dark" : "light");
};
function loadTheme() {
    if (localStorage.getItem("dashboard_theme") === "dark") document.body.classList.add("dark");
}
window.openSidebar = function() {
    document.getElementById("sidebar").classList.add("active");
    document.getElementById("overlay").classList.add("active");
    document.body.classList.add("sidebar-open");
    document.getElementById("menuBtn").innerHTML = "✕";
};
window.closeSidebar = function() {
    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
    document.body.classList.remove("sidebar-open");
    document.getElementById("menuBtn").innerHTML = "☰";
};
window.toggleSidebar = function() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar && sidebar.classList.contains("active")) closeSidebar();
    else openSidebar();
};
window.toggleProfileMenu = function() {
    document.getElementById("profileDropdown").classList.toggle("active");
};

function setActiveMenu() {
    const page = window.location.pathname.split("/").pop() || "dashboard.html";
    const menus = {
        "dashboard.html": "nav-dashboard", "planner.html": "nav-planner", "ideas.html": "nav-planner", 
        "notepad.html": "nav-notepad", "script.html": "nav-notepad", "notes.html": "nav-notes",
        "calculator.html": "nav-calculator", "trash.html": "nav-trash"
    };
    if (menus[page]) document.getElementById(menus[page])?.classList.add("active");
}

// =========================================================
// 5. FUNGSI GLOBAL SINKRONISASI UI (DIPANGGIL OLEH HALAMAN)
// =========================================================
window.updateNavbarUI = function(name, email, photoURL) {
    const safeName = name || "Kreator";
    const firstLetter = safeName.charAt(0).toUpperCase();
    
    // Update Teks Inisial
    document.querySelectorAll("#avatarText, #profileAvatar").forEach(el => {
        el.innerHTML = firstLetter;
        el.style.display = photoURL ? "none" : "flex"; 
    });

    // Update Text Nama dan Email
    document.querySelectorAll("#profileName").forEach(el => el.innerHTML = safeName);
    document.querySelectorAll("#profileEmail").forEach(el => el.innerHTML = email || "kreator@creative.io");

    // Update Gambar Foto Profil
    document.querySelectorAll("#avatarImg, #profileAvatarImg").forEach(el => {
        if (photoURL) {
            el.src = photoURL;
            el.style.display = "block";
        } else {
            el.src = "";
            el.style.display = "none";
        }
    });
};

// =========================================================
// 6. FUNGSI LOGOUT
// =========================================================
window.logout = function() {
    if (!confirm("Apakah Anda yakin ingin keluar dari akun?")) return;
    // Pindah ke login (Firebase SignOut akan ditangani di halaman masing-masing jika perlu, atau otomatis terputus)
    localStorage.removeItem('dummy_logged_in');
    window.location.href = rootPath + "login.html";
};
