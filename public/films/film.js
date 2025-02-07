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

document
  .getElementById("searchInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      let query = this.value.trim();
      if (query.length > 2) {
      window.location.href = `https://geromstudio.glitch.me/search.html?q=${encodeURIComponent(query)}&connect=true`;
      }
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
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

async function fetchProfilePicture() {
  const uniqueId = getCookie("uniqueId"); // Récupérer l'ID unique à partir des cookies

  if (!uniqueId) {
    console.error("UniqueId introuvable dans les cookies.");
    return;
  }

  // Vérifier si l'image est déjà en cache dans localStorage
  const cachedImage = localStorage.getItem(`profile-picture-${uniqueId}`);
  if (cachedImage) {
    console.log("Image trouvée dans le cache.");
    const profilePicture = document.getElementById("profile-picture");
    profilePicture.style.backgroundImage = `url(${cachedImage})`;
    return; // Si l'image est en cache, ne pas envoyer la requête
  }

  try {
    const response = await fetch(`/profile-picture/${uniqueId}`);
    const data = await response.json();

    if (data.success && data.imageUrl) {
      // Enregistrer l'URL de l'image dans le cache
      localStorage.setItem(`profile-picture-${uniqueId}`, data.imageUrl);

      // Afficher l'image
      const profilePicture = document.getElementById("profile-picture");
      profilePicture.style.backgroundImage = `url(${data.imageUrl})`;
    } else {
      console.error("Erreur dans la réponse du serveur.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image :", error);
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

const carousel = document.querySelector(".carousel");
const items = document.querySelectorAll(".carousel-item");
const itemWidth = items[0].offsetWidth + 30;

function moveNext() {
  carousel.style.transition = "none";
  const firstItem = carousel.firstElementChild;
  carousel.appendChild(firstItem);
  carousel.style.transform = "translateX(0)";
  carousel.offsetHeight;
  carousel.style.transition = "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
  carousel.style.transform = `translateX(-${itemWidth}px)`;
}

function movePrev() {
  carousel.style.transition = "none";
  const lastItem = carousel.lastElementChild;
  carousel.prepend(lastItem);
  carousel.style.transform = `translateX(-${itemWidth}px)`;
  carousel.offsetHeight;
  carousel.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
  carousel.style.transform = "translateX(0)";
}

// Auto scroll toutes les 12 secondes
let autoScroll = setInterval(moveNext, 12000);

document.getElementById("next").addEventListener("click", () => {
  clearInterval(autoScroll);
  moveNext();
  autoScroll = setInterval(moveNext, 12000);
});

document.getElementById("prev").addEventListener("click", () => {
  clearInterval(autoScroll);
  movePrev();
  autoScroll = setInterval(moveNext, 12000);
});


document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("connect") === "true") {
    onUserConnected();
  } else {
    onUserDisconnected();
  }
});
