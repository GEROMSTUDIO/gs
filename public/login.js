const forms = document.querySelector(".forms"), 
      pwShowHide = document.querySelectorAll(".eye-icon"),
      links = document.querySelectorAll(".link");

// Ajouter un gestionnaire d'événement au clic sur chaque icône pour basculer la visibilité du mot de passe
pwShowHide.forEach(eyeIcon => {
  eyeIcon.addEventListener("click", () => {
    let pwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".password");

    pwFields.forEach(password => {
      if (password.type === "password") { // Si le mot de passe est caché
        password.type = "text"; // Afficher le mot de passe
        eyeIcon.classList.replace("bx-hide", "bx-show"); // Changer l'icône pour l'état 'montrer'
        return;
      }
      password.type = "password"; // Cacher le mot de passe
      eyeIcon.classList.replace("bx-show", "bx-hide"); // Changer l'icône pour l'état 'cacher'
    });
  });
});

// Ajouter un gestionnaire d'événement au clic sur chaque lien pour basculer entre les formulaires
links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault(); // Empêcher le comportement par défaut du lien
    forms.classList.toggle("show-signup");
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.form.login form');
  const emailInput = loginForm.querySelector('input[type="email"]');
  const passwordInput = loginForm.querySelector('input[type="password"]');
  const errorMessage = document.querySelector('.error-message'); // Sélectionner l'élément d'erreur

  // Formulaire de login
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = emailInput.value;
    const password = passwordInput.value;

    // Réinitialiser le message d'erreur avant chaque tentative
    errorMessage.style.display = 'none';

    try {
      // Envoyer les données de connexion au serveur
      const response = await fetch('/login', { // Correspond à la route définie dans server.js
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Rediriger l'utilisateur vers 'index.html' avec l'identifiant unique
        window.location.href = `/index.html?userId=${result.userId}`;
      } else {
        // Afficher un message d'erreur si les identifiants sont incorrects
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Erreur lors de la requête :', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  });

  // Formulaire de signup
  const signupForm = document.querySelector('.form.signup form');
  const signupEmailInput = signupForm.querySelector('input[type="email"]');
  const signupPasswordInput = signupForm.querySelectorAll('input[type="password"]');

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const signupEmail = signupEmailInput.value;
    const signupPassword = signupPasswordInput[0].value; // Premier champ de mot de passe
    const confirmPassword = signupPasswordInput[1].value; // Deuxième champ de mot de passe

    if (signupPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      // Envoyer les données d'inscription au serveur
      const response = await fetch('/signup', { // Correspond à la route définie dans server.js
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: signupEmail, password: signupPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        // Rediriger l'utilisateur ou afficher un message de succès
        window.location.href = '/login.html'; // Rediriger vers la page de connexion
      } else {
        // Afficher un message d'erreur si l'inscription échoue
        alert(result.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur lors de la requête :', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  });
});
