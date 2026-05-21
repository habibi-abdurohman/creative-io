/* =========================================================
   1. AUTO-ROUTING (CEGAH ERROR 404 DI GITHUB PAGES)
   Mendeteksi lokasi file agar path selalu akurat ke root
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
            // Memastikan link navigasi di dalam navbar selalu memiliki path yang tepat
            let processedHtml = html
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

    // Event listener untuk menutup sidebar/dropdown saat klik di luar
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
    const menuBtn = document.getElementById("menuBtn");
    if(menuBtn) menuBtn.innerHTML = "✕";
};

window.closeSidebar = function() {
    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
    document.body.classList.remove("sidebar-open");
    const menuBtn = document.getElementById("menuBtn");
    if(menuBtn) menuBtn.innerHTML = "☰";
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
        "notepad.html": "nav-notepad",
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
const USE_FIREBASE = true; 

function setupFirebaseUserObserver() {
    if (USE_FIREBASE) {
        import(rootPath + "js/firebase.js")
            .then(module => {
                import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js")
                    .then(authLib => {
                        authLib.onAuthStateChanged(module.auth, (user) => {
                            if (user) {
                                renderUserData(
                                    user.displayName || "Kreator", 
                                    user.email, 
                                    user.photoURL
                                );
                            } else {
                                // Jika tidak login, arahkan ke login page (Kecuali sudah di login/register)
                                const path = window.location.pathname;
                                if (!path.includes("login.html") && !path.includes("register.html") && !path.includes("forgot-password.html")) {
                                    window.location.href = rootPath + "login.html";
                                }
                            }
                        });
                    });
            })
            .catch(err => console.log("Mode Offline/Lokal"));
    } else {
        const savedProfile = JSON.parse(localStorage.getItem('creative_user_profile'));
        if (savedProfile) {
            renderUserData(savedProfile.name || "Kreator", "kreator@creative.io", savedProfile.photo || null);
        }
    }
}

function renderUserData(name, email, photoURL) {
    // Kunci: Hanya cari elemen yang ada di DALAM navbar/sidebar
    const navContainer = document.getElementById("navbar-container") || document;
    const sidebar = document.getElementById("sidebar") || document;

    const firstLetter = (name || "K").charAt(0).toUpperCase();
    
    // Update Teks Inisial
    navContainer.querySelectorAll("#avatarText, #profileAvatar").forEach(el => {
        el.innerHTML = firstLetter;
        el.style.display = photoURL ? "none" : "flex"; 
    });

    // Update Nama dan Email
    navContainer.querySelectorAll("#profileName").forEach(el => el.innerHTML = name || "Kreator");
    navContainer.querySelectorAll("#profileEmail").forEach(el => el.innerHTML = email || "kreator@creative.io");

    // Update Foto Profil
    navContainer.querySelectorAll("#avatarImg, #profileAvatarImg").forEach(el => {
        if (photoURL) {
            el.src = photoURL;
            el.style.display = "block";
        } else {
            el.src = "";
            el.style.display = "none";
        }
    });
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
                    .then(() => { window.location.href = rootPath + "login.html"; })
                    .catch((err) => { alert("Error: " + err.message); });
            });
        });
    } else {
        localStorage.removeItem('dummy_logged_in');
        window.location.href = rootPath + "login.html";
    }
};

window.addEventListener('profileUpdated', () => {
    setupFirebaseUserObserver(); // Tarik data ulang seketika!
});
