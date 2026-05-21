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
            const processedHtml = html
                .replace(/href="pages\//g, `href="${rootPath}pages/`)
                .replace(/href="profil.html"/g, `href="${rootPath}profil.html"`);
                
            navbarContainer.innerHTML = processedHtml;
            initNavbar(); // Jalankan fungsi setelah HTML masuk ke layar
        })
        .catch(error => console.error("Error memuat navbar:", error));
});

/* =========================================================
   3. INISIALISASI FITUR NAVBAR
========================================================= */
function initNavbar() {
    loadTheme();
    setupFirebaseUserObserver(); // Ini yang menarik data User!
    setActiveMenu();

    window.addEventListener("click", function(e) {
        const profile = document.querySelector(".profile-wrap");
        const dropdown = document.getElementById("profileDropdown");
        if (profile && !profile.contains(e.target)) {
            dropdown?.classList.remove("active");
        }
    });
}

/* =========================================================
   4. SISTEM TEMA & KENDALI UI SIDEBAR
========================================================= */
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
    const activeId = menus[page];
    if (activeId) document.getElementById(activeId)?.classList.add("active");
}

/* =========================================================
   5. SINKRONISASI DATA USER KE SELURUH HALAMAN
========================================================= */
const USE_FIREBASE = true;

function setupFirebaseUserObserver() {
    if (USE_FIREBASE) {
        import(rootPath + "js/firebase.js").then(module => {
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js").then(authLib => {
                authLib.onAuthStateChanged(module.auth, (user) => {
                    if (user) {
                        // Cek apakah ada foto yang tersimpan di memori HP (LocalStorage)
                        const savedPhoto = localStorage.getItem(`creative_photo_${user.uid}`);
                        
                        // Kirim data ke UI Navbar
                        renderUserData(user.displayName, user.email, savedPhoto || user.photoURL);
                    }
                });
            });
        });
    }
}

function renderUserData(name, email, photoURL) {
    const firstLetter = (name || "User").charAt(0).toUpperCase();
    
    // Ganti inisial huruf (U)
    document.querySelectorAll("#avatarText, #profileAvatar").forEach(el => {
        el.innerHTML = firstLetter;
        el.style.display = photoURL ? "none" : "flex"; 
    });

    // Ganti Nama dan Email
    document.querySelectorAll("#profileName").forEach(el => el.innerHTML = name || "User");
    document.querySelectorAll("#profileEmail").forEach(el => el.innerHTML = email || "user@email.com");

    // Ganti Foto Bulat Kecil & Besar di Navbar
    document.querySelectorAll("#avatarImg, #profileAvatarImg").forEach(el => {
        if (photoURL) {
            el.src = photoURL;
            el.style.display = "block";
        } else {
            el.style.display = "none";
        }
    });
}

// "Telinga" pendengar jika ada perubahan dari profil.html
window.addEventListener('profileUpdated', () => {
    setupFirebaseUserObserver(); // Refresh data navbar seketika
});

/* =========================================================
   6. FUNGSI LOGOUT
========================================================= */
window.logout = function() {
    if (!confirm("Apakah Anda yakin ingin keluar dari akun?")) return;
    if (USE_FIREBASE) {
        import(rootPath + "js/firebase.js").then(module => {
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js").then(authLib => {
                authLib.signOut(module.auth).then(() => window.location.href = rootPath + "login.html");
            });
        });
    }
};
