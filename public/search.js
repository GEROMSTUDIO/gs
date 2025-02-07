if (window.location.protocol === "http:") {
  window.location.replace("https" + window.location.href.slice(4));
}

async function fetchResults() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  document.getElementById(
    "searchQuery"
  ).innerText = `Résultats pour : "${query}"`;

  let response = await fetch(`/search?q=${query}`);
  let pages = await response.json();

  let resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = ""; // Efface les anciens résultats

  if (pages.length === 0) {
    resultsContainer.innerHTML = "<p>Aucun résultat trouvé.</p>";
    return;
  }

  pages.forEach((page) => {
    let div = document.createElement("div");
    div.className = "result-card";
    div.innerHTML = `
                    <h3>${page.title}</h3>
                    <p>${page.description}</p>
                `;
    div.addEventListener("click", () => {
      window.location.href = page.url;
    });
    resultsContainer.appendChild(div);
  });
}

fetchResults();

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
    
  } else if (!uniqueId && !currentUrl.includes("connect=false")) {
    console.log("Non connecté");
        const redirectURL = `https://geromstudio.glitch.me/search.html`;
        const togo = `&connect=false`;
    const params = window.location.search;
    location.href = redirectURL + params + togo;
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

document
  .getElementById("searchInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      let query = this.value.trim();
      if (query.length > 2) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}&connect=true`;
      }
    }
  });

function onUserConnected() {
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
  const loginButton = document.querySelector(".right-nav .login");

  if (loginButton) {
    loginButton.classList.add("show-login");
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
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
