document.addEventListener("DOMContentLoaded", () => {
  console.log("Le script est chargé et prêt.");

  window.onUserConnected = function () {
    // Masquer le lien "Se connecter"
    const loginLink = document.querySelector("a.login");
    if (loginLink) {
      loginLink.style.display = "none";
    }
    console.log("Utilisateur connecté : lien 'Se connecter' masqué.");
  };
});

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
    // Si on descend, cacher le header
    header.classList.add("hidden");
  } else {
    // Si on remonte, afficher le header
    header.classList.remove("hidden");
  }
  lastScrollY = window.scrollY;

  if (window.scrollY === 0) {
    header.classList.add("bg");
  } else {
    header.classList.remove("bg");
  }
});
