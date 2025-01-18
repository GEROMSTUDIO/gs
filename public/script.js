if (window.location.protocol === 'http:') {
  window.location.replace('https'+window.location.href.slice(4))
}

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
    const redirectURL = `https://geromstudio.glitch.me/index.html?connect=true&uniqueId=${encodeURIComponent(
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

searchBox.addEventListener("click", function (event) {
  searchBox.classList.toggle("open");
  searchIcon.style.display = searchBox.classList.contains("open")
    ? "none"
    : "inline-block";
  if (searchBox.classList.contains("open")) {
    searchInput.focus();
  }
  event.stopPropagation();
});

document.addEventListener("click", function (event) {
  if (!searchBox.contains(event.target)) {
    searchBox.classList.remove("open");
    searchIcon.style.display = "inline-block";
  }
});

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
    if (window.scrollY > 0) {
      header.classList.add("hidden");
      dropdownMenu.style.display = "none";
    }
  } else {
    header.classList.remove("hidden");
  }

  lastScrollY = window.scrollY;

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
    loginButton.classList.remove("show-login");
  }

  if (profilePicture) {
    profilePicture.classList.add("show");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    if (dropdownMenu) {
      dropdownMenu.style.display = "";
    }
  }

  fetchProfilePicture();
}

function onUserDisconnected() {
  console.log("L'utilisateur n'est pas connecté !");

  const loginButton = document.querySelector(".right-nav .login");

  if (loginButton) {
    loginButton.classList.add("show-login");
  }
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

  // Vérifier si l'URL de l'image est déjà stockée dans le localStorage
  const storedImageUrl = localStorage.getItem("profilePictureUrl");

  if (storedImageUrl) {
    // Si l'image est déjà dans le localStorage, l'utiliser directement
    profilePicture.style.backgroundImage = `url(${storedImageUrl})`;
    profilePicture.style.backgroundColor = "transparent";
    profilePicture.classList.add("show");
    return;
  }

  try {
    // Si l'image n'est pas dans le localStorage, la récupérer depuis le backend
    const response = await fetch(`/profile-picture/${uniqueId}`);
    const data = await response.json();

    if (data.success && data.imageUrl) {
      // Stocker l'URL de l'image dans le localStorage pour les futurs chargements
      localStorage.setItem("profilePictureUrl", data.imageUrl);
      profilePicture.style.backgroundImage = `url(${data.imageUrl})`;
      profilePicture.style.backgroundColor = "transparent";
      profilePicture.classList.add("show");
    } else {
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

const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");
const menuList = document.getElementById("menu-list");

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  menu.style.display =
    menu.style.display === "none" || menu.style.display === ""
      ? "block"
      : "none";
});

document.addEventListener("click", (event) => {
  if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
    menu.style.display = "none";
  }
});

const uniqueId = getCookie("uniqueId");

if (uniqueId) {
  menuList.innerHTML = `
        <li><a href="/profile.html" class="profile">Mon compte</a></li>
        <li><a href="/disconnect.html" class="logout">Se déconnecter</a></li>
      `;
  menu.style.width = "170px";
} else {
  menuList.innerHTML = `
        <li><a href="/login.html" class="login">Se connecter</a></li>
      `;
  menu.style.width = "150px";
}

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("connect") === "true") {
    onUserConnected();
  } else {
    onUserDisconnected();
  }
});
