function acceptCookies() {
  localStorage.setItem("cookieConsent", "accepted");
  hideBanner();
}

function rejectCookies() {
  localStorage.setItem("cookieConsent", "rejected");
  hideBanner();
}

function hideBanner() {
  const banner = document.getElementById("cookieBanner");
  banner.style.opacity = "0";
  setTimeout(() => {
    banner.classList.remove("show");
    banner.style.opacity = "1";
  }, 300);
}

// Fonction pour obtenir un cookie par son nom
function getUniqueIdFromCookie() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("uniqueId="))
    ?.split("=")[1];
}

// Vérifie l'authentification immédiatement
(function checkAuth() {
  const uniqueId = getUniqueIdFromCookie();
  const currentUrl = window.location.href;

  // Vérifie si l'URL actuelle ne contient pas déjà les paramètres
  if (!currentUrl.includes("connect=true") && uniqueId) {
    const redirectURL = `/index.html?connect=true&uniqueId=${encodeURIComponent(
      uniqueId
    )}`;
    window.location.href = redirectURL;
  } else if (!uniqueId) {
    console.log("Non connecté");
  }
})();

window.addEventListener("load", function () {
  const banner = document.getElementById("cookieBanner");
  const cookieConsent = localStorage.getItem("cookieConsent");

  if (!cookieConsent) {
    setTimeout(() => {
      banner.classList.add("show");
    }, 1000);
  }
});

const searchBox = document.getElementById("searchBox");
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");

// Afficher ou masquer le champ de recherche
searchBox.addEventListener("click", function (event) {
  searchBox.classList.toggle("open");
  searchIcon.style.display = searchBox.classList.contains("open")
    ? "none"
    : "inline-block";
  if (searchBox.classList.contains("open")) {
    searchInput.focus(); // Focus sur le champ de texte quand il apparaît
  }
  event.stopPropagation(); // Empêche la propagation de l'événement au document
});

// Fermer le champ de recherche si l'utilisateur clique ailleurs
document.addEventListener("click", function (event) {
  if (!searchBox.contains(event.target)) {
    searchBox.classList.remove("open");
    searchIcon.style.display = "inline-block";
  }
});

// Fermer le champ de recherche si l'utilisateur appuie sur Entrée
searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchBox.classList.remove("open");
    searchIcon.style.display = "inline-block";
  }
});

const header = document.getElementById("header");
header.classList.add("bg");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  if (window.scrollY > lastScrollY) {
    // Si on descend, cacher le header, sauf si on est déjà en haut
    if (window.scrollY > 0) {
      header.classList.add("hidden");
    }
  } else {
    // Si on remonte, afficher le header
    header.classList.remove("hidden");
  }

  lastScrollY = window.scrollY;

  // Vérifie si on est vraiment en haut de la page
  if (window.scrollY === 0) {
    header.classList.add("bg");
  } else {
    header.classList.remove("bg");
  }
});

function onUserConnected() {
  console.log("L'utilisateur est connecté !");
  // Cache le bouton de connexion en ajoutant une classe
  const loginButton = document.querySelector(".right-nav .login");
  const acount = document.querySelector(".right-nav .acount");
  if (loginButton) {
    loginButton.classList.add("hidden");
    acount.classList.remove("hidden");
  }
}

// Cette partie doit rester en JavaScript
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("connect") === "true") {
    onUserConnected();
  }
});
