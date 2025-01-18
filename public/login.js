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

  // Vérifie si l'URL<link rel="icon" href="https://i.ibb.co/jg1z28S/logo.png" type="image/x-icon">ect=true") && uniqueId) {
    const redirectURL = `/profile.html`;
    window.location.href = redirectURL;
  } else if (!uniqueId) {
  }
})();

const forms = document.querySelector(".forms"),
  pwShowHide = document.querySelectorAll(".eye-icon"),
  links = document.querySelectorAll(".link");

// Ajouter un gestionnaire d'événement au clic sur chaque icône pour basculer la visibilité du mot de passe
pwShowHide.forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    let pwFields =
      eyeIcon.parentElement.parentElement.querySelectorAll(".password");

    pwFields.forEach((password) => {
      if (password.type === "password") {
        password.type = "text";
        eyeIcon.classList.replace("bx-hide", "bx-show");
        return;
      }
      password.type = "password";
      eyeIcon.classList.replace("bx-show", "bx-hide");
    });
  });
});

// Ajouter un gestionnaire d'événement au clic sur chaque lien pour basculer entre les formulaires
links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    forms.classList.toggle("show-signup");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".form.login form");
  const emailInput = loginForm.querySelector('input[type="email"]');
  const passwordInput = loginForm.querySelector('input[type="password"]');
  const errorMessage = document.querySelector(".error-message");

  // Formulaire de login
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = emailInput.value;
    const password = passwordInput.value;

    // Réinitialiser le message d'erreur avant chaque tentative
    errorMessage.style.display = "none";

    try {
      // Envoyer les données de connexion au serveur
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Résultat reçu :", result); // Vérifiez ici que unique_id est correct
        const redirectURL = `https://geromstudio.glitch.me/index.html?connect=true&uniqueId=${encodeURIComponent(
          result.user.unique_id
        )}`;
        const date = new Date();
        date.setTime(date.getTime() + 86400 * 1000); // 24 heures en millisecondes
        document.cookie = `uniqueId=${
          result.user.unique_id
        }; path=/; expires=${date.toUTCString()}; max-age=86400; secure; samesite=strict`;
        window.location.href = redirectURL;
      } else {
        // Afficher un message d'erreur si les identifiants sont incorrects
        errorMessage.textContent = result.error || "Erreur de connexion.";
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  });

  // Formulaire de signup
  const signupForm = document.querySelector(".form.signup form");
  const signupEmailInput = signupForm.querySelector('input[type="email"]');
  const signupPasswordInput = signupForm.querySelectorAll(
    'input[type="password"]'
  );

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const signupEmail = signupEmailInput.value;
    const signupPassword = signupPasswordInput[0].value; // Premier champ de mot de passe
    const confirmPassword = signupPasswordInput[1].value; // Deuxième champ de mot de passe

    if (signupPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      // Envoyer les données d'inscription au serveur
      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Rediriger l'utilisateur ou afficher un message de succès
        window.location.href = "/signup.html"; // Rediriger vers la page de connexion
      } else {
        alert(result.message || "Erreur lors de l'inscription.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  });
});
