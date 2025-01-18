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
    const redirectURL = `/page.html?connect=true&uniqueId=${encodeURIComponent(
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
      dropdownMenu.style.display = "none";
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
  const loginButton = document.querySelector(".right-nav .login");
  const profilePicture = document.getElementById("profile-picture");

  if (loginButton) {
    loginButton.style.display = "none"; // Cache le bouton de connexion
  }
  if (profilePicture) {
    profilePicture.classList.add("show"); // Affiche la photo de profil
    dropdownMenu.style.display = "";
  }

  fetchProfilePicture();
}

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}

async function fetchProfilePicture() {
  const uniqueId = getCookie("uniqueId");
  const profilePicture = document.getElementById("profile-picture");

  if (!uniqueId) {
    console.error("UniqueId introuvable dans les cookies.");
    return;
  }

  try {
    const response = await fetch(`/profile-picture/${uniqueId}`);
    const data = await response.json();

    if (data.success && data.imageUrl) {
      profilePicture.style.backgroundImage = `url(${data.imageUrl})`;
      profilePicture.style.backgroundColor = "transparent";
      profilePicture.classList.add("show");
    } else {
      // En cas d'erreur, afficher une image par défaut
      profilePicture.style.backgroundImage = `url('https://img.icons8.com/fluency/48/test-account--v1.png')`;
      profilePicture.classList.add("show");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image :", error);
    profilePicture.style.backgroundImage = `url('https://img.icons8.com/fluency/48/test-account--v1.png')`;
    profilePicture.classList.add("show");
  }
}

document.addEventListener("DOMContentLoaded", fetchProfilePicture);

const profileContainer = document.getElementById("profile-container");
const dropdownMenu = document.getElementById("dropdown-menu");

profileContainer.addEventListener("click", () => {
  const isMenuVisible = dropdownMenu.style.display === "block";
  dropdownMenu.style.display = isMenuVisible ? "none" : "block";
});

document.addEventListener("click", (event) => {
  if (
    !profileContainer.contains(event.target) &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.style.display = "none";
  }
});

    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    const menuList = document.getElementById('menu-list');

    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
    });

    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
        menu.style.display = 'none';
      }
    });

    const uniqueId = getCookie('uniqueId');

    if (uniqueId) {
      // Si unique_id existe, afficher "Mon compte" et "Se déconnecter"
      menuList.innerHTML = `
        <li><a href="/profile.html" class="profile">Mon compte</a></li>
        <li><a href="/disconnect.html" class="logout">Se déconnecter</a></li>
      `;
      menu.style.width = '170px'; // Agrandir légèrement le menu pour les options supplémentaires
    } else {
      // Sinon, afficher "Se connecter"
      menuList.innerHTML = `
        <li><a href="/login.html" class="login">Se connecter</a></li>
      `;
      menu.style.width = '150px'; // Taille réduite pour "Se connecter"
    }

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("connect") === "true") {
    onUserConnected();
  }
});
