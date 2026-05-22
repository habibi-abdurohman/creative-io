// =========================================================
// NAVBAR.JS - PUSAT ROUTING & SINKRONISASI USER GLOBAL
// =========================================================
const isInsidePagesFolder = window.location.pathname.includes('/pages/');
const rootPath = isInsidePagesFolder ? '../' : './';

document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) return;

    // Load Navbar HTML
    fetch(rootPath + "navbar/navbar.html")
        .then(response => response.text())
        .then(html => {
            const processedHtml = html
                .replace(/href="pages\//g, `href="${rootPath}pages/`)
                .replace(/href="profil.html"/g, `href="${rootPath}profil.html"`);
                
            navbarContainer.innerHTML = processedHtml;
            initNavbarUI(); 
            syncGlobalUserData(); // Panggil sinkronisasi Firebase otomatis
            
            // TAMBAHAN FIX PWA: Munculkan tombol install jika PWA event sudah ditangkap
            if (typeof window.showPwaButton === 'function') {
                window.showPwaButton();
            }
        })
        .catch(error => console.error("Error memuat navbar:", error));
});

function initNavbarUI() {
    loadTheme();
    setActiveMenu();

    window.addEventListener("click", function(e) {
        const profile = document.querySelector(".profile-wrap");
        const dropdown = document.getElementById("profileDropdown");
        if (profile && !profile.contains(e.target)) {
            dropdown?.classList.remove("active");
        }
    });
}

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

// FIX: Penyesuaian Active State Halaman
function setActiveMenu() {
    const page = window.location.pathname.split("/").pop() || "dashboard.html";
    const menus = {
        "dashboard.html": "nav-dashboard", 
        "ideas.html": "nav-ideas", 
        "script.html": "nav-script", 
        "notes.html": "nav-notes",
        "calculator.html": "nav-calculator", 
        "trash.html": "nav-trash"
    };
    if (menus[page]) {
        document.getElementById(menus[page])?.classList.add("active");
    }
}

// FIX: Sistem Sinkronisasi User Global yang Stabil
async function syncGlobalUserData() {
    try {
        const { auth } = await import(rootPath + 'js/firebase.js');
        const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");

        onAuthStateChanged(auth, (user) => {
            if (user) {
                const savedPhoto = localStorage.getItem(`creative_photo_${user.uid}`);
                updateNavbarUI(user.displayName, user.email, savedPhoto);
            }
        });
    } catch (error) {
        // Fallback untuk mode offline / dummy
        if (localStorage.getItem('dummy_logged_in') === 'true') {
            const profile = JSON.parse(localStorage.getItem('creative_user_profile')) || { name: "Kreator", email: "admin@creative.io" };
            updateNavbarUI(profile.name, profile.email, profile.photo);
        }
    }
}

window.updateNavbarUI = function(name, email, photoURL) {
    const safeName = name || "Kreator";
    const firstLetter = safeName.charAt(0).toUpperCase();
    
    document.querySelectorAll("#avatarText, #profileAvatar").forEach(el => {
        el.innerHTML = firstLetter;
        el.style.display = photoURL ? "none" : "flex"; 
    });

    document.querySelectorAll("#profileName").forEach(el => el.innerHTML = safeName);
    document.querySelectorAll("#profileEmail").forEach(el => el.innerHTML = email || "kreator@creative.io");

    document.querySelectorAll("#avatarImg, #profileAvatarImg").forEach(el => {
        if (photoURL && photoURL !== "null") {
            el.src = photoURL;
            el.style.display = "block";
        } else {
            el.src = "";
            el.style.display = "none";
        }
    });
};

window.logout = async function() {
    if (!confirm("Apakah Anda yakin ingin keluar dari akun?")) return;
    try {
        const { auth } = await import(rootPath + 'js/firebase.js');
        const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        await signOut(auth);
    } catch (e) {} // Abaikan error firebase
    
    localStorage.removeItem('dummy_logged_in');
    window.location.href = rootPath + "login.html";
};
