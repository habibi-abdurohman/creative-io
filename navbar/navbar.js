/* LOAD NAVBAR */

fetch("navbar/navbar.html")

.then(response => response.text())

.then(data => {

document.getElementById(
"navbar-container"
).innerHTML = data;

/* LOAD THEME */

if(

localStorage.getItem(
"dashboard_theme"
) === "dark"

){

document.body.classList.add(
"dark"
);

}

});

/* THEME */

function toggleTheme(){

document.body.classList.toggle(
"dark"
);

localStorage.setItem(

"dashboard_theme",

document.body.classList.contains(
"dark"
)
? "dark"
: "light"
);
}

/* OPEN */

function openSidebar(){

document.getElementById(
"sidebar"
).classList.add("active");

document.getElementById(
"overlay"
).classList.add("active");

document.body.classList.add(
"sidebar-open"
);

document.getElementById(
"menuBtn"
).innerHTML = "✕";
}

/* CLOSE */

function closeSidebar(){

document.getElementById(
"sidebar"
).classList.remove("active");

document.getElementById(
"overlay"
).classList.remove("active");

document.body.classList.remove(
"sidebar-open"
);

document.getElementById(
"menuBtn"
).innerHTML = "☰";
}

/* TOGGLE */

function toggleSidebar(){

const sidebar =
document.getElementById(
"sidebar"
);

if(

sidebar.classList.contains(
"active"
)

){

closeSidebar();

}else{

openSidebar();
}

}