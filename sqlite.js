const fs = require("fs");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Initialize the database
const dbFile = "data/users.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    try {
      if (!exists) {
        // Création de la table Users si elle n'existe pas
        await db.run(`
          CREATE TABLE Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            profile_picture TEXT DEFAULT '',
            access BOOLEAN DEFAULT FALSE,
            unique_id TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Création de la table Log pour tracer les connexions
        await db.run(`
          CREATE TABLE AuthLog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            action TEXT,
            time STRING
          )
        `);
        
        console.log("Base de données créée avec succès");
      } else {
        console.log("Base de données existante trouvée");
        console.log(await db.all("SELECT email, created_at from Users"));
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

module.exports = {
  /**
   * Créer un nouvel utilisateur
   * 
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe (sera hashé)
   * @returns {Object} Résultat de l'opération
   */
  createUser: async (email, password) => {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await db.get("SELECT email FROM Users WHERE email = ?", email);
      if (existingUser) {
        return { success: false, error: "Email déjà utilisé" };
      }

      // Générer un identifiant unique
      const uniqueId = crypto.randomBytes(16).toString('hex'); // 32 caractères hexadécimaux

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer le nouvel utilisateur
      await db.run(
        "INSERT INTO Users (email, password, unique_id, profile_picture, access) VALUES (?, ?, ?, ?, ?)",
        [email, hashedPassword, uniqueId, "", false]
      );

      // Logger l'action
      await db.run(
        "INSERT INTO AuthLog (email, action, time) VALUES (?, ?, ?)",
        [email, "signup", new Date().toISOString()]
      );

      return { success: true, message: "Utilisateur créé avec succès" };
    } catch (dbError) {
      console.error(dbError);
      return { success: false, error: "Erreur serveur" };
    }
  },

  /**
   * Récupérer les logs d'authentification
   * 
   * @returns {Array} Dernières entrées du log
   */
  getAuthLogs: async () => {
    try {
      return await db.all("SELECT * from AuthLog ORDER BY time DESC LIMIT 20");
    } catch (dbError) {
      console.error(dbError);
      return [];
    }
  },

  /**
   * Vérifier les identifiants d'un utilisateur
   * 
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe à vérifier
   * @returns {Object} Résultat de la vérification
   */
  verifyUser: async (email, password) => {
    try {
      const user = await db.get("SELECT * FROM Users WHERE email = ?", email);
      if (!user) {
        return { success: false, error: "Utilisateur non trouvé" };
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return { success: false, error: "Mot de passe incorrect" };
      }

      // Logger la connexion réussie
      await db.run(
        "INSERT INTO AuthLog (email, action, time) VALUES (?, ?, ?)",
        [email, "login", new Date().toISOString()]
      );

      return {
        success: true, 
        user: {
          email: user.email,
          unique_id: user.unique_id,  // Ajouter l'ID unique
          profile_picture: user.profile_picture,  // Ajouter l'image de profil
          access: user.access,  // Ajouter l'accès
          created_at: user.created_at
        }
      };
    } catch (dbError) {
      console.error(dbError);
      return { success: false, error: "Erreur serveur" };
    }
  }
};
