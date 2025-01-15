import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import auth from "./sqlite.js";
import bodyParser from "body-parser";

// Configuration ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ 
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Routes pour l'authentification
app.get("/script.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(path.join(__dirname, "public", "script.js"));
});

app.post("/login", async (request, response) => {
  const { email, password } = request.body;
  if (!email || !password) {
    response.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }
  
  const result = await auth.verifyUser(email, password);
  if (result.success) {
    response.status(200).json({ ...result, redirectUrl: "/?connect=true" });
  } else {
    response.status(401).json(result);
  }
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe sont requis" });
  }
  
  const result = await auth.createUser(email, password);
  if (result.success) {
    res.status(200).json({ message: "Inscription réussie !" });
  } else {
    res.status(400).json({ message: result.error });
  }
});

// Route pour le téléchargement d'images et mise à jour de la photo de profil
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier n'a été téléchargé." });
  }

  // Extraire l'unique_id du nom du fichier
  const uniqueId = path.parse(req.file.originalname).name;
  
  const filePath = req.file.path;
  const apiKey = "b6aaa0c67529d227d7396207ae91c63a";
  const imgbbUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;

  try {
    const imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });

    const response = await fetch(imgbbUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        image: imageBase64,
      }),
    });

    const result = await response.json();

    // Supprime le fichier temporaire
    fs.unlinkSync(filePath);

    if (result.success) {
      const imageUrl = result.data.display_url;
      console.log("\n=== Image uploadée avec succès ===");
      console.log("URL de l'image:", imageUrl);
      console.log("Unique ID:", uniqueId);
      console.log("=====================================\n");

      // Met à jour la base de données avec l'URL de l'image en utilisant unique_id
      const updateResult = await auth.updateProfilePictureByUniqueId(uniqueId, imageUrl);

      if (updateResult.success) {
        res.status(200).json({
          success: true,
          message: "Photo de profil mise à jour avec succès !",
          imageUrl: imageUrl
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Erreur lors de la mise à jour de la photo de profil.",
          error: updateResult.error
        });
      }
    } else {
      res.status(500).json({ 
        success: false,
        message: "Échec du téléchargement de l'image sur ImgBB.",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Erreur lors du traitement de l'image :", error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors du traitement de l'image.",
      error: error.message
    });
  }
});

// Route par défaut pour les 404
app.get("*", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Démarrage du serveur
const listener = app.listen(PORT, () => {
  console.log("Votre application écoute sur le port " + listener.address().port);
});