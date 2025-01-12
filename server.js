const express = require("express");
const auth = require("./sqlite.js");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Modification pour servir le fichier script.js avec le paramètre de connexion
app.get("/script.js", (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

// Route pour la page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.use("", (req, res, next) => {
  //res.status(404).send("File not found"); // Renvoie 404 pour empêcher l'accès direct
  // Ou redirige vers une page d'erreur personnalisée
  res.status(404).sendFile(path.join(__dirname, "public/404.html"));
});

app.post("/login", async (request, response) => {
  const { email, password } = request.body;
  if (!email || !password) {
    response.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }
  const result = await auth.verifyUser(email, password);
  if (result.success) {
    // Redirection vers index.html avec le paramètre connect=true
    response.status(200).json({ ...result, redirectUrl: '/?connect=true' });
  } else {
    response.status(401).json(result);
  }
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }
    const result = await auth.createUser(email, password);
    if (result.success) {
        res.status(200).json({ message: 'Inscription réussie !' });
    } else {
        res.status(400).json({ message: result.error });
    }
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Votre application écoute sur le port " + listener.address().port);
});