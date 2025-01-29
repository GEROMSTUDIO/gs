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
const validUniqueId = "4ce1f89302953b32f6a66e5f817b43f2";
const validPassword = "Studiopro38@";

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const films = {
  "": {
    filmName: "",
    filmName2: "",
    actors: [""],
    director: "",
    summary: "",
    posterLink: "",
    filmLink: ""
  },
    "requin": {
    filmName: "Le Requin",
    filmName2: "Le Requin",
    actors: ["Le Requin, Des humains"],
    director: "Romain Lastella",
    summary: "Un requin cherche à manger dans l'Océan",
    posterLink: "https://i.ibb.co/KqXr1Ss/requin.png",
    filmLink: "https://drive.google.com/file/d/1Phlnoqo0xkVoUNvA-IMk3siQZe_68lEQ/preview"
  },
  "La Grande Révélation": {
    filmName: "La Grande Révélation",
    filmName2: "La Grande Révélation",
    actors: ["Hanna Bedhiaf, Baptiste Blache, Tristan Vaucheret Perrier..."],
    director: "Romain Lastella",
    summary: "Comme tous les matins Agatha se rendait au Collège mais aujourd'hui tous bascule...",
    posterLink: "https://i.ibb.co/h9X4Fb2/La-Grande-R-v-lation.webp",
    filmLink: "https://drive.google.com/file/d/1wdMp62bhBd7I0J0m_cW0fvpsdfeSBiCY/preview"
  }
};



app.use(bodyParser.json());
app.use("/views", express.static(path.join(__dirname, "views")));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

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

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Aucun fichier n'a été téléchargé." });
  }

  const uniqueId = path.parse(req.file.originalname).name;

  const filePath = req.file.path;
  const apiKey = "b6aaa0c67529d227d7396207ae91c63a";
  const imgbbUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;

  try {
    const imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });

    const response = await fetch(imgbbUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        image: imageBase64,
      }),
    });

    const result = await response.json();

    fs.unlinkSync(filePath);

    if (result.success) {
      const imageUrl = result.data.display_url;

      const updateResult = await auth.updateProfilePictureByUniqueId(
        uniqueId,
        imageUrl
      );

      if (updateResult.success) {
        res.status(200).json({
          success: true,
          message: "Photo de profil mise à jour avec succès !",
          imageUrl: imageUrl,
        });
      } else {
        res.status(400).json({
          success: false,
          error: updateResult.error,
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
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
      error: error.message,
    });
  }
});

app.get('/film/:filmName', (req, res) => {
  const filmName = req.params.filmName; // Récupération du nom du film dans la requête

  // Recherche du film dans la base de données locale
  const film = films[filmName];

  if (film) {
    // Si le film est trouvé, renvoyer ses informations
    res.json(film);
  } else {
    // Si le film n'est pas trouvé, renvoyer un message d'erreur
    res.status(404).json({ error: "Film non trouvé" });
  }
});

app.post('/addFilm', (req, res) => {
  // Vérification des champs requis dans la requête
  const { filmName, filmName2, actors, director, summary, posterLink, filmLink } = req.body;

  if (!filmName || !filmName2 || !actors || !director || !summary || !posterLink || !filmLink) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  // Ajout du film à la liste
  films[filmName] = {
    filmName,
    filmName2,
    actors: Array.isArray(actors) ? actors : actors.split(','), // Convertir les acteurs en tableau si nécessaire
    director,
    summary,
    posterLink,
    filmLink,
  };

  console.log(`Film ajouté : ${filmName}`);
  res.status(201).json({ message: `Le film "${filmName}" a été ajouté avec succès.` });
});



app.get("/profile-picture/:uniqueId", async (req, res) => {
  try {
    const uniqueId = req.params.uniqueId;

    if (!uniqueId) {
      return res.status(400).json({
        success: false,
        message: "L'identifiant unique est requis",
      });
    }

    const result = await auth.getProfilePictureByUniqueId(uniqueId);

    if (result.success) {
      res.status(200).json({
        success: true,
        imageUrl: result.profile_picture,
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la photo de profil:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de la photo de profil",
    });
  }
});

app.get("/check-access", async (req, res) => {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId) {
      return res.status(400).json({ error: "Identifiant unique manquant" });
    }
    const result = await auth.verifyAccess(uniqueId);
    if (result.success && result.access === 1) {
      const carouselContent = `
        <div> <h2 class="titrefilm">Nos Films </h2></div>
        <div class="carousel">
          <a href="films/film.html?film=La%20Grande%20R%C3%A9v%C3%A9lation" class="carousel-item">
            <div class="image-container">
              <img
                src="https://i.ibb.co/h9X4Fb2/La-Grande-R-v-lation.webp"
                alt="Affiche"
              />
            </div>
            <div class="movie-title">La Grande Révélation</div>
          </a>
          <a href="#" class="carousel-item">
            <div class="image-container">
              <img
                src="https://i.ibb.co/MsDKMMR/4a713bad-8b3f-4590-a36b-208b78c65901.webp"
                alt="Affiche"
              />
            </div>
            <div class="movie-title">Face aux difficultés</div>
          </a>
          <a href="#" class="carousel-item">
            <div class="image-container">
              <img
                src="https://i.ibb.co/cgZPRk5/Le-myst-re-de-l-afaire-Joseline-P-tunia.webp"
                alt="Affiche"
              />
            </div>
            <div class="movie-title">
              Le mystére de l'affaire Joseline Pétunia
            </div>
          </a>
          <a href="#" class="carousel-item">
            <div class="image-container">
              <img
                src="https://i.ibb.co/xXnGL1H/Anniversaire-surprise-pour-Chantal.webp"
                alt="Affiche"
              />
            </div>
            <div class="movie-title">Anniversaire suprise pour Chantal</div>
          </a>
          <a href="#" class="carousel-item">
            <div class="image-container">
              <img
                src="https://i.ibb.co/h1YWcX3/74-ans-G-rard.webp"
                alt="Affiche"
              />
            </div>
            <div class="movie-title">74 ans Gérard</div>
          </a>
          <a href="#" class="carousel-item">
            <div class="image-container">
              <img
                src="https://i.ibb.co/zsNypQ3/l-imposteur-adams.webp"
                alt="Affiche"
              />
            </div>
            <div class="movie-title">L'imposteur Adams</div>
          </a>
          <a href="films/film.html?film=requin" class="carousel-item">
            <div class="image-container">
              <img src="https://i.ibb.co/KqXr1Ss/requin.png" alt="Affiche" />
            </div>
            <div class="movie-title">Le Requin</div>
          </a>
          <a href="#" class="carousel-item">
            <div class="image-container">
              <img
                src="https://i.ibb.co/Tv125hp/50-ans-David.webp"
                alt="Affiche"
              />
            </div>
            <div class="movie-title">50 ans David</div>
          </a>
          <a href="#" class="carousel-item">
            <div class="image-container">
              <img
                src="https://i.ibb.co/QpBb6rs/Design-sans-titre.webp"
                alt="Affiche"
              />
            </div>
            <div class="movie-title">Noêl au Collège</div>
          </a>
        </div>
        <div class="controls">
          <button id="prev">←</button>
          <button id="next">→</button>
        </div>
      `;

      res.json({ carouselContent });
    } else {
      res.status(403).json({ error: "Accès interdit : droits insuffisants" });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification d'accès:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/verify-password", (req, res) => {
  const { password, uniqueId } = req.body;

  if (uniqueId === validUniqueId && password === validPassword) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post("/grant-access", async (req, res) => {
  try {
    const { email, uniqueId } = req.body; // Utilisation de req.body et non req.query

    if (!email || !uniqueId) {
      return res
        .status(400)
        .json({
          success: false,
          error: "L'email et l'identifiant unique sont requis",
        });
    }

    if (uniqueId !== validUniqueId) {
      return res
        .status(403)
        .json({ success: false, error: "Autorisation refusée" });
    }

    // Fonction pour accorder l'accès
    const result = await auth.grantAccessByEmail(email);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Erreur lors de l'attribution de l'accès :", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

app.post("/revoke-access", async (req, res) => {
  try {
    const { email, uniqueId } = req.body; // Utilisation de req.body et non req.query

    if (!email || !uniqueId) {
      return res
        .status(400)
        .json({
          success: false,
          error: "L'email et l'identifiant unique sont requis",
        });
    }

    if (uniqueId !== validUniqueId) {
      return res
        .status(403)
        .json({ success: false, error: "Autorisation refusée" });
    }

    // Fonction pour révoquer l'accès
    const result = await auth.revokeAccessByEmail(email);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Erreur lors de la révocation de l'accès :", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
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
