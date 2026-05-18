/* LOAD NAVBAR */
fetch("/navbar/navbar.html")
.then(res => res.text())
.then(data => {
    const container =
        document.getElementById("navbar-container") ||
        document.getElementById("navbar-placeholder") ||
        document.querySelector("header");

    if(container){
        container.innerHTML = data;
    }
    initNavbar();
});

/* INITIALIZATION */
function initNavbar(){
    loadTheme();
    setupFirebaseUserObserver();
    setActiveMenu();
}

/* THEME SYSTEM */
function toggleTheme(){
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "dashboard_theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
}

function loadTheme(){
    if(localStorage.getItem("dashboard_theme") === "dark"){
        document.body.classList.add("dark");
    }
}

/* SIDEBAR CONTROLLER */
function openSidebar(){
    document.getElementById("sidebar").classList.add("active");
    document.getElementById("overlay").classList.add("active");
    document.body.classList.add("sidebar-open");
    document.getElementById("menuBtn").innerHTML = "✕";
}

function closeSidebar(){
    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
    document.body.classList.remove("sidebar-open");
    document.getElementById("menuBtn").innerHTML = "☰";
}

function toggleSidebar(){
    const sidebar = document.getElementById("sidebar");
    if(sidebar && sidebar.classList.contains("active")){
        closeSidebar();
    } else {
        openSidebar();
    }
}

/* PROFILE DROPDOWN */
function toggleProfileMenu(){
    document.getElementById("profileDropdown").classList.toggle("active");
}

/* CLOSE DROPDOWN ON CLICK OUTSIDE */
window.addEventListener("click", function(e){
    const profile = document.querySelector(".profile-wrap");
    const dropdown = document.getElementById("profileDropdown");
    if(profile && !profile.contains(e.target)){
        dropdown?.classList.remove("active");
    }
});

/* NAVIGATION HIGHLIGHTER */
function setActiveMenu(){
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
    if(activeId){
        document.getElementById(activeId)?.classList.add("active");
    }
}

/* =========================================================
   FIREBASE INTEGRATION READY HOOKS
========================================================= */

function setupFirebaseUserObserver() {
    /* 
       ALUR FIREBASE ASLI (Aktifkan Nanti):
       import { getAuth, onAuthStateChanged } from "firebase/auth";
       const auth = getAuth();
       onAuthStateChanged(auth, (user) => {
           if (user) {
               renderUserData(user.displayName || "Kreator", user.email, user.photoURL);
           } else {
               window.location.href = "../login.html";
           }
       });
    */
    
    // LOGIKA TESTING OFFLINE (Sinkron dengan profil.html)
    const savedProfile = JSON.parse(localStorage.getItem('creative_user_profile'));
    if (savedProfile) {
        renderUserData(savedProfile.name || "Kreator", "kreator@creative.io", savedProfile.photo || null);
    } else {
        renderUserData("Kreator", "kreator@creative.io", null);
    }
}

function renderUserData(name, email, photoURL) {
    const firstLetter = name.charAt(0).toUpperCase();
    
    const avatarTextEl = document.getElementById("avatarText");
    const profileAvatarEl = document.getElementById("profileAvatar");
    if(avatarTextEl) avatarTextEl.innerHTML = firstLetter;
    if(profileAvatarEl) profileAvatarEl.innerHTML = firstLetter;

    const profileNameEl = document.getElementById("profileName");
    const profileEmailEl = document.getElementById("profileEmail");
    if(profileNameEl) profileNameEl.innerHTML = name;
    if(profileEmailEl) profileEmailEl.innerHTML = email;

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

function logout(){
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar dari akun?");
    if(!confirmLogout) return;

    /*
       ALUR FIREBASE ASLI (Aktifkan Nanti):
       import { getAuth, signOut } from "firebase/auth";
       const auth = getAuth();
       signOut(auth).then(() => {
           window.location.href = "../login.html";
       }).catch((err) => {
           alert("Gagal Log Out: " + err.message);
       });
    */
    
    window.location.href = "../login.html";
}
