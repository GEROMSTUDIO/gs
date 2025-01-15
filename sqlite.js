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
        console.log("Création de la base de données...");
        // Création de la table Users
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
        console.log("Base de données créée avec succès !");
      } else {
        console.log("Base de données existante détectée.");
        console.log(await db.all("SELECT * FROM Users"));
      }
    } catch (dbError) {
      console.error("Erreur lors de la configuration de la base de données :", dbError);
    }
  });

module.exports = {
  /**
   * Créer un nouvel utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Object} Résultat de l'opération
   */
  createUser: async (email, password) => {
    try {
      // Vérifiez si l'utilisateur existe déjà
      const existingUser = await db.get("SELECT email FROM Users WHERE email = ?", email);
      if (existingUser) {
        return { success: false, error: "Email déjà utilisé" };
      }

      // Générer un identifiant unique
      const uniqueId = crypto.randomBytes(16).toString("hex"); // 32 caractères hexadécimaux

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log("Données à insérer :");
      console.log({
        email,
        hashedPassword,
        uniqueId,
        profile_picture: "",
        access: false
      });

      // Insérer l'utilisateur dans la base de données
      const result = await db.run(
        `
          INSERT INTO Users (email, password, unique_id, profile_picture, access) 
          VALUES (?, ?, ?, ?, ?)
        `,
        [email, hashedPassword, uniqueId, "", false]
      );

      if (result && result.changes === 1) {
        console.log("Nouvel utilisateur inséré avec succès !");
      } else {
        console.error("Échec de l'insertion de l'utilisateur.");
      }

      // Logger l'action
      await db.run(
        "INSERT INTO AuthLog (email, action, time) VALUES (?, ?, ?)",
        [email, "signup", new Date().toISOString()]
      );

      return { success: true, message: "Utilisateur créé avec succès" };
    } catch (dbError) {
      console.error("Erreur lors de la création de l'utilisateur :", dbError);
      return { success: false, error: "Erreur serveur" };
    }
  },

  /**
   * Vérifier les identifiants d'un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Object} Résultat de l'opération
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
          unique_id: user.unique_id,
          profile_picture: user.profile_picture,
          access: user.access,
          created_at: user.created_at
        }
      };
    } catch (dbError) {
      console.error("Erreur lors de la vérification de l'utilisateur :", dbError);
      return { success: false, error: "Erreur serveur" };
    }
  },
  
  /**
 * Met à jour l'URL de la photo de profil d'un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} imageUrl - URL de la photo de profil
 * @returns {Object} Résultat de l'opération
 */
  updateProfilePicture: async (email, imageUrl) => {
  try {
    // Mettre à jour la colonne profile_picture pour l'utilisateur donné
    const result = await db.run(
      "UPDATE Users SET profile_picture = ? WHERE email = ?",
      [imageUrl, email]
    );

    if (result.changes === 1) {
      return { success: true, message: "Photo de profil mise à jour avec succès" };
    } else {
      return { success: false, error: "Utilisateur non trouvé" };
    }
  } catch (dbError) {
    console.error("Erreur lors de la mise à jour de la photo de profil :", dbError);
    return { success: false, error: "Erreur serveur" };
  }
}


};

