
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
