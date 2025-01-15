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

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

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
    return res
      .status(400)
      .json({ message: "Email et mot de passe sont requis" });
  }
  const result = await auth.createUser(email, password);
  if (result.success) {
    res.status(200).json({ message: "Inscription réussie !" });
  } else {
    res.status(400).json({ message: result.error });
  }
});

// Routes pour le téléchargement d'images
app.post("/upload", upload.single("image"), async (req, res) => {
  const filePath = req.file.path;
  const apiKey = "b6aaa0c67529d227d7396207ae91c63a";
  const imgbbUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;

  try {
    const imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });

    const response = await fetch(imgbbUrl, {
      method: "POST",
      body: new URLSearchParams({
        image: imageBase64,
        name: req.file.originalname,
      }),
    });

    const result = await response.json();

    fs.unlinkSync(filePath);

    if (result.success) {
      const imageUrl = result.data.url;

      try {
        // Supposons que vous avez l'email ou un identifiant unique pour mettre à jour le bon utilisateur
        const userEmail = req.body.email; // ou un autre identifiant provenant de votre requête

        // Mettre à jour la base de données
        await db.run("UPDATE Users SET profile_picture = ? WHERE email = ?", [
          imageUrl,
          userEmail,
        ]);

        console.log(
          "URL de l'image enregistrée dans la base de données avec succès !"
        );
      } catch (error) {
        console.error(
          "Erreur lors de l'enregistrement de l'URL dans la base de données :",
          error
        );
        return res
          .status(500)
          .send("Erreur serveur lors de l'enregistrement de l'image.");
      }
    } else {
      res.status(500).send("Failed to upload the image. Please try again.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the image.");
  }
});

// Route par défaut pour les 404
app.get("*", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Démarrage du serveur
const listener = app.listen(PORT, () => {
  console.log(
    "Votre application écoute sur le port " + listener.address().port
  );
});
