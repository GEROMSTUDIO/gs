const express = require("express");
const auth = require("./sqlite.js");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Servir les fichiers statiques du répertoire "public"
app.use(express.static(path.join(__dirname, "public")));

// Route de connexion (traiter le formulaire)
app.post("/login", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    response.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }

  const result = await auth.verifyUser(email, password);

  if (result.success) {
    response.status(200).json(result);
  } else {
    response.status(401).json(result);
  }
});

// Route pour gérer l'inscription des utilisateurs
app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    // Vérifiez que l'email et le mot de passe sont fournis
    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }

    // Logique pour enregistrer l'utilisateur dans la base de données ici
    // Pour l'exemple, on renvoie simplement un message de succès
    res.status(200).json({ message: 'Inscription réussie !' });
});


// Listen for requests
const listener = app.listen(process.env.PORT, () => {
  console.log("Votre application écoute sur le port " + listener.address().port);
});
