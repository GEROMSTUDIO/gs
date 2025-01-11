const express = require("express");
const auth = require("./sqlite.js");
const bodyParser = require("body-parser");
const path = require("path");
const { verifyLogin } = require('./sqlite');

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  verifyLogin(email, password, (err, result) => {
    if (err) {
      console.error('Erreur lors de la vérification du login:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }

    if (result.success) {
      return res.status(200).json({ success: true, uniqueId: result.uniqueId });
    } else {
      return res.status(401).json({ success: false, message: result.message });
    }
  });
  
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }

    const result = await auth.createUser(email, password);

    // Vérifiez le résultat de la création
    if (result.success) {
        res.status(200).json({ message: 'Inscription réussie !' });
    } else {
        res.status(400).json({ message: result.error });
    }
});


// Listen for requests
const listener = app.listen(process.env.PORT, () => {
  console.log("Votre application écoute sur le port " + listener.address().port);
});
