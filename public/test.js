document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("filmForm");
  const output = document.getElementById("generatedCode");

  // Variables pour le script et le modèle HTML
  let scriptContent = "";
  let templateHTML = "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const filmName = document.getElementById("filmName").value;
    const actors = document.getElementById("actors").value;
    const director = document.getElementById("director").value;
    const summary = document.getElementById("summary").value;
    const posterLink = document.getElementById("posterLink").value;

    // Définir le modèle HTML
    templateHTML = `
    <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Films</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link rel="stylesheet" href="film.css" />
          <link
            rel="icon"
            href="https://i.ibb.co/0XR2Yd5/logo.webp"
            type="image/x-icon"
          />
          <meta
            name="description"
            content="Page de film, Ici tous les films de GEROM STUDIO sont présent"
          />
          <link rel="stylesheet" href="film.css" />
        </head>

        <body>
          <div class="main-content">
            <header id="header">
              <nav class="left-nav">
                <a href="https://geromstudio.glitch.me/film.html" class="film">Films</a>
                <a href="#" class="about">À propos</a>
                <a href="#" class="contact">Contact</a>
              </nav>
              <a href="/index.html" class="home">
                <img
                  class="logo"
                  src="https://i.ibb.co/pZyKf6K/Logo-removebg-preview.webp"
                  alt="Logo du site"
                />
              </a>
              <nav class="right-nav">
                <a href="login.html" class="login">Se connecter</a>
                <div class="search-container" id="searchBox">
                  <span class="search-icon" id="searchIcon">
                    <i class="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="Rechercher..."
                    id="searchInput"
                  />
                </div>
                <div class="profile-container" id="profile-container">
                  <div id="profile-picture"></div>
                  <div class="dropdown-arrow"></div>
                </div>
                <div class="dropdown-menu" id="dropdown-menu">
                  <a href="/profile.html" class="profile-button">Mon compte</a>
                  <div class="dropdown-divider"></div>
                  <a href="/disconnect.html" class="logout-button">Se déconnecter</a>
                </div>
              </nav>
            </header>

            <section class="section">
              <img
                src="${posterLink}"
                alt="Affiche du film"
                class="poster"
              />
              <div class="content2">
                <h1 class="title">${filmName}</h1>
                <div class="line-container">
                  <p class="line">Avec</p>
                  <p class="credits">${actors}</p>
                </div>
                <div class="authors-container">
                  <p class="line2">de</p>
                  <p class="authors">${director}</p>
                </div>
                <p class="synopsis">
                  ${summary}
                </p>
              </div>
            </section>

            <div class="cookie-banner" id="cookieBanner">
              <div class="cookie-container">
                <div class="cookie-content">
                  <img
                    src="https://img.icons8.com/?size=64&id=KEx6NTeFDrA8&format=png"
                    alt="Popcorn icon"
                    class="cookie-icon"
                  />
                  <div class="cookie-text">
                    Ce site utilise des cookies pour vous garantir la meilleure expérience sur notre site. En utilisant notre site, vous acceptez les cookies.
                    <a href="#" class="cookie-link">Découvrir nos conditions</a>
                  </div>
                </div>
                <div class="cookie-buttons">
                  <button class="cookie-btn accept-btn" onclick="acceptCookies()">
                    Autoriser
                  </button>
                  <button class="cookie-btn reject-btn" onclick="rejectCookies()">
                    Refuser
                  </button>
                </div>
              </div>
            </div>

            <div class="central-container">
              <div id="menu-toggle" class="menu-toggle">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>

              <div id="menu" class="menu">
                <ul id="menu-list"></ul>
              </div>
            </div>
          </div>

          <div class="footer-dark">
            <footer>
              <div>
                <div class="footer-content">
                  <div>
                    <h3>Services</h3>
                    <ul>
                      <li>
                        <a href="https://geromstudio.glitch.me/film.html" aria-label="Page des films">Film</a>
                      </li>
                      <li><a href="#" aria-label="Page de contact">Contact</a></li>
                      <li><a href="#" aria-label="Page des emploi">Emploi</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3>À propos</h3>
                    <ul>
                      <li><a href="#" aria-label="Page de la production">Production</a></li>
                      <li><a href="#" aria-label="Page de l'équipe">Équipe</a></li>
                      <li><a href="#" aria-label="Page des actualité">Actualité</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3>Company Name</h3>
                    <p>
                      Société de production cinématographique dédiée à la création de contenus professionnels pour le grand écran. Nous accompagnons chaque étape de vos projets, de l’idée originale à la post-production finale.
                    </p>
                  </div>
                </div>
                <div class="social-icons" style="margin-top: 20px">
                  <a href="https://www.youtube.com/@GEROMSTUDIO" target="_blank" alt="Youtube" aria-label="Liens Youtube">
                    <i class="fab fa-youtube"></i>
                  </a>
                </div>
                <p class="copyright">GEROM STUDIO © 2025</p>
              </div>
            </footer>
          </div>  
  
      </body>
      </html>
    `;

    // Définir le script JavaScript à inclure
    scriptContent = `
    <script>
      // Fonction pour récupérer un cookie par son nom
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
      }

      function checkAccess() {
        const uniqueId = getCookie("uniqueId");

        if (!uniqueId) {
          window.location.href = `/login.html`;
          return;
        }

        fetch(`/check-access?uniqueId=${uniqueId}`)
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              window.location.href = `/blocked.html`;
              throw new Error("Accès refusé");
            }
          })
          .then((data) => {
            // Charger dynamiquement le script film.js
            const script = document.createElement("script");
            script.src = "/film.js";
            script.onload = () => {};
            script.onerror = () => {};
            document.body.appendChild(script);
          })
          .catch((error) => {
            document.getElementById("message").textContent =
              "Accès non autorisé : " + error.message;
            window.location.href = `/403.html`;
          });
      }

      // Lancer la vérification au chargement de la page
      window.onload = checkAccess;

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
    </script>
    `;

    // Générer le code final (combinaison du modèle HTML et du script)
    const finalCode = templateHTML + scriptContent;

    // Afficher le code généré dans la zone de sortie
    output.textContent = finalCode.trim();
  });
});
