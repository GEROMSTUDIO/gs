const express = require("express");
const auth = require("/sqlite.js"); // Notre module modifié
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Route d'inscription
app.post("/signup", async (request, response) => {
  const { email, password } = request.body;
  
  if (!email || !password) {
    response.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }

  const result = await auth.createUser(email, password);
  
  if (result.success) {
    response.status(201).json(result);
  } else {
    response.status(400).json(result);
  }
});

// Route de connexion
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

// Route pour voir les logs (optionnel, pour debug)
app.get("/logs", async (request, response) => {
  const logs = await auth.getAuthLogs();
  response.json(logs);
});

// Listen for requests
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});