const express = require("express");
const auth = require("./sqlite.js");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Modification pour servir le fichier script.js avec le paramètre de connexion
app.get("/script.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(path.join(__dirname, "public", "script.js"));
});

app.get("*", (req, res) => {
  // Si la requête GET ne correspond à aucune route définie, rediriger vers 404.html
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
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

app.post("/upload", upload.single("image"), async (req, res) => {
  const filePath = req.file.path;
  const apiKey = "b6aaa0c67529d227d7396207ae91c63a"; // Replace with your actual API key
  const imgbbUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;

  try {
    // Read the image file as a base64 string
    const imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });

    // Send the image to imgbb
    const response = await fetch(imgbbUrl, {
      method: "POST",
      body: new URLSearchParams({
        image: imageBase64,
        name: req.file.originalname,
      }),
    });

    const result = await response.json();

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    if (result.success) {
      const imageUrl = result.data.url;
      res.send(`
        <h1>Upload Successful!</h1>
        <p>Your image URL: <a href="${imageUrl}" target="_blank">${imageUrl}</a></p>
        <img src="${imageUrl}" alt="Profile Picture" />
      `);
    } else {
      res.status(500).send("Failed to upload the image. Please try again.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the image.");
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log(
    "Votre application écoute sur le port " + listener.address().port
  );
});
