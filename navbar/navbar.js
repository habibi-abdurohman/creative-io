/* =========================================================
   1. AUTO-ROUTING (CEGAH ERROR 404 DI GITHUB PAGES)
========================================================= */
const isInsidePagesFolder = window.location.pathname.includes('/pages/');
const rootPath = isInsidePagesFolder ? '../' : './';

/* =========================================================
   2. FETCH & RENDER NAVBAR HTML
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) return;

    fetch(rootPath + "navbar/navbar.html")
        .then(response => {
            if (!response.ok) throw new Error("Navbar HTML tidak ditemukan.");
            return response.text();
        })
        .then(html => {
            // Suntikkan rootPath ke link-link di dalam HTML yang mungkin membutuhkan
            // Walaupun di HTML Anda sudah pakai path relatif, ini berjaga-jaga
            const processedHtml = html
                .replace(/href="pages\//g, `href="${rootPath}pages/`)
                .replace(/href="profil.html"/g, `href="${rootPath}profil.html"`);
                
            navbarContainer.innerHTML = processedHtml;
            initNavbar();
        })
        .catch(error => console.error("Error memuat navbar:", error));
});

/* =========================================================
   3. INISIALISASI FITUR NAVBAR
========================================================= */
function initNavbar() {
    loadTheme();
    setupFirebaseUserObserver();
    setActiveMenu();

    // Event listener tambahan untuk menutup sidebar/dropdown saat klik di luar
    window.addEventListener("click", function(e) {
        const profile = document.querySelector(".profile-wrap");
        const dropdown = document.getElementById("profileDropdown");
        if (profile && !profile.contains(e.target)) {
            dropdown?.classList.remove("active");
        }
    });
}

/* =========================================================
   4. SISTEM TEMA (DARK/LIGHT MODE)
========================================================= */
// Ubah window.toggleTheme agar bisa dipanggil dari atribut onclick di HTML
window.toggleTheme = function() {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "dashboard_theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
};

function loadTheme() {
    if (localStorage.getItem("dashboard_theme") === "dark") {
        document.body.classList.add("dark");
    }
}

/* =========================================================
   5. KENDALI SIDEBAR
========================================================= */
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
    if (sidebar && sidebar.classList.contains("active")) {
        closeSidebar();
    } else {
        openSidebar();
    }
};

/* =========================================================
   6. DROPDOWN PROFIL
========================================================= */
window.toggleProfileMenu = function() {
    document.getElementById("profileDropdown").classList.toggle("active");
};

/* =========================================================
   7. HIGHLIGHT MENU AKTIF DI SIDEBAR
========================================================= */
function setActiveMenu() {
    const page = window.location.pathname.split("/").pop() || "dashboard.html";
    const menus = {
        "dashboard.html": "nav-dashboard",
        "planner.html": "nav-planner",
        "ideas.html": "nav-planner", // Adaptasi nama baru
        "notepad.html": "nav-notepad",
        "script.html": "nav-notepad", // Adaptasi nama baru
        "notes.html": "nav-notes",
        "calculator.html": "nav-calculator",
        "trash.html": "nav-trash"
    };

    const activeId = menus[page];
    if (activeId) {
        document.getElementById(activeId)?.classList.add("active");
    }
}

/* =========================================================
   8. SISTEM OTENTIKASI & USER DATA (HYBRID)
========================================================= */
const USE_FIREBASE = true; // Sakelar Firebase

function setupFirebaseUserObserver() {
    if (USE_FIREBASE) {
        import(rootPath + "js/firebase.js")
            .then(module => {
                import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js")
                    .then(authLib => {
                        authLib.onAuthStateChanged(module.auth, (user) => {
                            if (user) {
                                // Panggil UI Profil
                                renderUserData(
                                    user.displayName || "Kreator", 
                                    user.email, 
                                    user.photoURL
                                );
                            } else {
                                window.location.href = rootPath + "login.html";
                            }
                        });
                    });
            })
            .catch(err => console.log("Menjalankan mode lokal (Gagal muat Firebase)"));
    } else {
        // LOGIKA TESTING OFFLINE LOKAL
        const savedProfile = JSON.parse(localStorage.getItem('creative_user_profile'));
        if (savedProfile) {
            renderUserData(savedProfile.name || "Kreator", "kreator@creative.io", savedProfile.photo || null);
        } else {
            renderUserData("Kreator", "kreator@creative.io", null);
        }
    }
}

function renderUserData(name, email, photoURL) {
    const firstLetter = name.charAt(0).toUpperCase();
    
    // Inisial Avatar (Text)
    const avatarTextEl = document.getElementById("avatarText");
    const profileAvatarEl = document.getElementById("profileAvatar");
    if(avatarTextEl) avatarTextEl.innerHTML = firstLetter;
    if(profileAvatarEl) profileAvatarEl.innerHTML = firstLetter;

    // Teks Nama & Email
    const profileNameEl = document.getElementById("profileName");
    const profileEmailEl = document.getElementById("profileEmail");
    if(profileNameEl) profileNameEl.innerHTML = name;
    if(profileEmailEl) profileEmailEl.innerHTML = email;

    // Foto Avatar (Jika Ada)
    const avatarImgEl = document.getElementById("avatarImg");
    const profileAvatarImgEl = document.getElementById("profileAvatarImg");

    if (photoURL && avatarImgEl && profileAvatarImgEl) {
        avatarImgEl.src = photoURL;
        avatarImgEl.style.display = "block";
        if(avatarTextEl) avatarTextEl.style.display = "none";

        profileAvatarImgEl.src = photoURL;
        profileAvatarImgEl.style.display = "block";
        if(profileAvatarEl) profileAvatarEl.style.display = "none";
    }
}

/* =========================================================
   9. FUNGSI LOGOUT
========================================================= */
window.logout = function() {
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar dari akun?");
    if (!confirmLogout) return;

    if (USE_FIREBASE) {
        import(rootPath + "js/firebase.js").then(module => {
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js").then(authLib => {
                authLib.signOut(module.auth)
                    .then(() => {
                        window.location.href = rootPath + "login.html";
                    })
                    .catch((err) => {
                        alert("Gagal Log Out: " + err.message);
                    });
            });
        });
    } else {
        localStorage.removeItem('dummy_logged_in');
        window.location.href = rootPath + "login.html";
    }
};
