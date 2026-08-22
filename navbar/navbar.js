(function () {
    if (window.__creativeNavbarLoaded) {
        return;
    }
    window.__creativeNavbarLoaded = true;
    const isInsideSubfolder =
        window.location.pathname.includes('/pages/') ||
        window.location.pathname.includes('/collab/');
    const rootPath =
        isInsideSubfolder
            ? '../'
            : './';
    function mountNavbar() {
        const navbarContainer =
            document.getElementById("navbar-container");
        if (!navbarContainer) {
            console.warn(
                "Navbar: #navbar-container tidak ditemukan."
            );
            return;
        }
        if (navbarContainer.dataset.navbarMounted === "true") {
            return;
        }
        navbarContainer.dataset.navbarMounted = "true";
        fetch(
            rootPath + "navbar/navbar.html",
            {
                cache: "no-store"
            }
        )
            .then(response => {
                if (!response.ok) {
                    throw new Error(
                        "HTTP " + response.status
                    );
                }
                return response.text();
            })
            .then(html => {
                const processedHtml =
                    html
                        .replace(
                            /href="pages\//g,
                            `href="${rootPath}pages/`
                        )
                        .replace(
                            /href="collab\//g,
                            `href="${rootPath}collab/`
                        )
                        .replace(
                            /href="profil.html"/g,
                            `href="${rootPath}profil.html"`
                        );
                navbarContainer.innerHTML =
                    processedHtml;
                initNavbarUI();
                syncGlobalUserData();
                if (
                    typeof window.showPwaButton ===
                    "function"
                ) {
                    window.showPwaButton();
                }
            })
            .catch(error => {
                navbarContainer.dataset.navbarMounted =
                    "false";
                console.error(
                    "Error memuat navbar:",
                    error
                );
            });
    }
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            mountNavbar,
            {
                once: true
            }
        );
    } else {
        mountNavbar();
    }
function initNavbarUI() {
    loadTheme();
    setPageContext(); 
    showNavbarLoadingSpinner();
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
    const avatarImg = document.getElementById("avatarImg");
    if (avatarImg && avatarImg.src.includes("data:image/svg")) {
        showNavbarLoadingSpinner();
    }
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
function setPageContext() {
    const page = window.location.pathname.split("/").pop() || "dashboard.html";
    const pageConfig = {
        "dashboard.html": { id: "nav-dashboard", title: "Dashboard Creative.io", icon: "🏠" },
        "profil.html": { id: null, title: "Pengaturan Profil", icon: "⚙️" },
        "ideas.html": { id: "nav-ideas", title: "Idea Board", icon: "💡" },
        "script.html": { id: "nav-script", title: "Script Writer", icon: "📝" },
        "notes.html": { id: "nav-notes", title: "Notes", icon: "📒" },
        "career.html": { id: "nav-career", title: "Career Tracker", icon: "💼" },
        "portfolio.html": { id: "nav-portfolio", title: "Portofolio", icon: "◉" },
        "music.html": { id: "nav-music", title: "Music Player", icon: "🎵" },
        "todolist.html": { id: "nav-todolist", title: "To-Do List", icon: "✓" },
        "wallet.html": { id: "nav-wallet", title: "Wallet & Analitik", icon: "💳" },
        "calculator.html": { id: "nav-calculator", title: "Calculator", icon: "🧮" },
        "collab-hub.html": { id: "nav-collab", title: "Kolaborasi", icon: "🤝" },
        "collab-script.html": { id: "nav-collab", title: "Collab Script", icon: "📝" }, 
        "collab-notes.html": { id: "nav-collab", title: "Collab Notes", icon: "📒" },
        "collab-ideas.html": { id: "nav-collab", title: "Collab Ideas", icon: "💡" },
        "trash.html": { id: "nav-trash", title: "Trash", icon: "🗑️" },
        "progress.html": { id: "nav-progress", title: "Laporan Progres", icon: "📈" }
    };
    const current = pageConfig[page] || { id: null, title: "Creative.io", icon: "✨" };
    if (current.id) {
        document.getElementById(current.id)?.classList.add("active");
    }
    const titleEl = document.getElementById("dynamicNavTitle");
    if (titleEl) {
        titleEl.innerHTML = `<span class="nav-title-icon">${current.icon}</span> ${current.title}`;
    }
    document.title = `${current.title} - Creative.io`;
}
async function syncGlobalUserData() {
    try {
        const { auth, db } = await import(rootPath + 'js/firebase.js'); 
        const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        const { doc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"); 
        onAuthStateChanged(auth, (user) => {
            if (user) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    let hasLoadedAvatarOnce = false;
                    onSnapshot(userRef, { includeMetadataChanges: true }, (docSnap) => {
                        if (docSnap.exists()) {
                            const dbData = docSnap.data();
                            const finalName = dbData.name || dbData.displayName || user.displayName;
                            const finalPhoto = dbData.photoURL || user.photoURL; 
                            const isFromCache = docSnap.metadata.fromCache;
                            if (!hasLoadedAvatarOnce && isFromCache && !finalPhoto) {
                                setTimeout(() => {
                                    if (!hasLoadedAvatarOnce) {
                                        hasLoadedAvatarOnce = true;
                                        updateNavbarUI(finalName, user.email, finalPhoto);
                                    }
                                }, 1500);
                                return;
                            }
                            hasLoadedAvatarOnce = true;
                            updateNavbarUI(finalName, user.email, finalPhoto);
                        } else {
                            updateNavbarUI(user.displayName, user.email, user.photoURL);
                        }
                    });
                } catch (e) {
                    console.warn("Gagal listen data Firestore untuk Navbar:", e);
                    updateNavbarUI(user.displayName, user.email, user.photoURL);
                }
            } else {
                // Firebase adalah gerbang utama aplikasi. Begitu sesinya tidak
                // ada lagi, jangan biarkan bearer token Drive bertahan untuk
                // akun Firebase berikutnya pada perangkat yang sama.
                localStorage.removeItem('creative_music_google_token_v1');
            }
        });
    } catch (error) {
        if (localStorage.getItem('dummy_logged_in') === 'true') {
            const profile = JSON.parse(localStorage.getItem('creative_user_profile')) || { name: "Kreator", email: "admin@creative.io" };
            updateNavbarUI(profile.name, profile.email, profile.photo);
        }
    }
}
window.updateNavbarUI = function(name, email, photoURL) {
    const safeName = name || "Kreator";
    const cleanName = safeName.trim();
    const firstLetter = (cleanName ? cleanName.charAt(0) : 'U').toUpperCase();
    let finalAvatarSrc = photoURL;
    const isPhotoValid = finalAvatarSrc && finalAvatarSrc !== "null" && finalAvatarSrc !== "";
    if (isPhotoValid) {
        document.querySelectorAll("#avatarImg, #profileAvatarImg").forEach(el => {
            el.src = finalAvatarSrc;
            el.style.display = "block";
        });
        document.querySelectorAll("#avatarText, #profileAvatar").forEach(el => {
            el.style.display = "none"; 
        });
    } else {
        document.querySelectorAll("#avatarText, #profileAvatar").forEach(el => {
            el.innerText = firstLetter;
            el.style.display = "flex"; 
        });
        document.querySelectorAll("#avatarImg, #profileAvatarImg").forEach(el => {
            el.style.display = "none";
            el.src = "";
        });
    }
    document.querySelectorAll("#profileName").forEach(el => el.textContent = safeName);
    document.querySelectorAll("#profileEmail").forEach(el => el.textContent = email || "kreator@creative.io");
};
function showNavbarLoadingSpinner() {
    const isDark = document.body.classList.contains('dark');
    const trackColor = isDark ? "%23334155" : "%23e2e8f0";
    const spinnerColor = isDark ? "%2364748b" : "%2394a3b8";
    const loadingSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="${trackColor}" stroke-width="6"/><path d="M50 20a30 30 0 0 1 30 30" fill="none" stroke="${spinnerColor}" stroke-width="8" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="0.8s" repeatCount="indefinite" /></path></svg>`;
    document.querySelectorAll("#avatarImg, #profileAvatarImg").forEach(el => {
        el.src = loadingSvg;
        el.style.display = "block";
    });
    document.querySelectorAll("#avatarText, #profileAvatar").forEach(el => {
        el.style.display = "none";
    });
}
window.logout = async function() {
    if (!confirm("Apakah Anda yakin ingin keluar dari akun?")) return;
    // Token Drive tidak boleh diwariskan ke pengguna Firebase berikutnya
    // pada browser yang sama.
    try {
        const savedGoogleSession = JSON.parse(localStorage.getItem('creative_music_google_token_v1') || 'null');
        const accessToken = savedGoogleSession && savedGoogleSession.accessToken;
        if (accessToken && window.google?.accounts?.oauth2) {
            window.google.accounts.oauth2.revoke(accessToken, () => {});
        }
    } catch (e) {}
    localStorage.removeItem('creative_music_google_token_v1');
    try {
        const { auth } = await import(rootPath + 'js/firebase.js');
        const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        await signOut(auth);
    } catch (e) {} 
    localStorage.removeItem('dummy_logged_in');
    window.location.href = rootPath + "login.html";
};
})();
