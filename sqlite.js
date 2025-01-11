const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); // Assurez-vous d'avoir installé bcrypt : npm install bcrypt

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
  }
});

// Création de la table "users" si elle n'existe pas encore
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      uniqueId TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table:', err.message);
    } else {
      console.log('Table "users" prête.');
    }
  });
});

// Fonction d'inscription : Ajouter un utilisateur dans la base de données
function registerUser(email, plainPassword, uniqueId, callback) {
  const saltRounds = 10; // Niveau de complexité pour bcrypt

  // Hacher le mot de passe avant de le stocker
  bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Erreur lors du hachage du mot de passe:', err);
      return callback(err);
    }

    const query = `INSERT INTO users (email, password, uniqueId) VALUES (?, ?, ?)`;

    db.run(query, [email, hashedPassword, uniqueId], function (err) {
      if (err) {
        console.error('Erreur lors de l\'insertion dans la base de données:', err.message);
        return callback(err);
      }
      console.log('Utilisateur enregistré avec succès :', email);
      return callback(null, { success: true, userId: this.lastID });
    });
  });
}

// Fonction de vérification de login : Comparer l'email et le mot de passe
function verifyLogin(email, plainPassword, callback) {
  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], (err, user) => {
    if (err) {
      console.error('Erreur lors de la requête SQLite:', err);
      return callback(err);
    }

    if (!user) {
      // Aucun utilisateur trouvé avec cet email
      return callback(null, { success: false, message: 'Email ou mot de passe incorrect.' });
    }

    // Comparer le mot de passe saisi avec le mot de passe haché dans la base de données
    bcrypt.compare(plainPassword, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error('Erreur lors de la comparaison bcrypt:', bcryptErr);
        return callback(bcryptErr);
      }

      if (isMatch) {
        // Mot de passe correct
        return callback(null, { success: true, uniqueId: user.uniqueId });
      } else {
        // Mot de passe incorrect
        return callback(null, { success: false, message: 'Email ou mot de passe incorrect.' });
      }
    });
  });
}

// Fonction pour vérifier si un utilisateur existe déjà (par email)
function userExists(email, callback) {
  const query = `SELECT COUNT(*) AS count FROM users WHERE email = ?`;

  db.get(query, [email], (err, row) => {
    if (err) {
      console.error('Erreur lors de la requête SQLite:', err);
      return callback(err);
    }

    callback(null, row.count > 0);
  });
}

// Export des fonctions
module.exports = {
  registerUser,
  verifyLogin,
  userExists,
};
