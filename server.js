const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

// Route de connexion
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  fs.readFile('login.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });

    const users = JSON.parse(data);
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      res.json({ message: 'Connexion réussie' });
    } else {
      res.status(401).json({ message: 'Identifiants incorrects' });
    }
  });
});

// Route d'inscription
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  fs.readFile('login.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });

    const users = JSON.parse(data);

    if (users.some(u => u.email === email)) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    users.push({ email, password });

    fs.writeFile('login.json', JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur' });

      res.status(201).json({ message: 'Utilisateur créé avec succès' });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
