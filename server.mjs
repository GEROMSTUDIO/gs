import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import fs from "fs";  // Module pour lire les fichiers

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(
  session({
    secret: "monSecretSuperSecurise",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Servir les fichiers statiques (login.html, etc.)
app.use(express.static(path.join(process.cwd(), "public")));

// Base de données simulée pour les tokens valides
const VALID_TOKENS = ["12345", "abcdef", "securetoken"];

// Route principale pour rediriger vers la page de connexion
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "login.html"));
});

// Endpoint pour valider le token
app.post("/api/login", (req, res) => {
  const { token } = req.body;

  if (VALID_TOKENS.includes(token)) {
    req.session.isAuthenticated = true; // Marquer l'utilisateur comme authentifié
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Token invalide !" });
  }
});

// Middleware pour vérifier l'authentification
function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect("/"); // Rediriger vers la page de connexion
  }
}

// Route protégée pour envoyer la page cachée depuis un fichier externe
app.get("/film", isAuthenticated, (req, res) => {
  // Lire le fichier HTML depuis le dossier 'views'
  fs.readFile(path.join(process.cwd(), "views", "hidden.html"), "utf-8", (err, data) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier :", err);
      res.status(500).send("Erreur serveur");
      return;
    }
    // Envoyer le contenu du fichier HTML au client
    res.send(data);
  });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
