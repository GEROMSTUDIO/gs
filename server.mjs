import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import auth from "./sqlite.js";
import chokidar from 'chokidar';
import bodyParser from "body-parser";
import Fuse from "fuse.js";

// Configuration ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const validUniqueId = "4ce1f89302953b32f6a66e5f817b43f2";
const validPassword = "Studiopro38@";

const app = express();
const PORT = process.env.PORT || 3000;

const pages = [
    { title: "Accueil", url: "/index.html", description: "Page d'accueil du site" },
    { title: "À propos", url: "/about.html", description: "En savoir plus sur notre production" },
    { title: "Contact", url: "/contact.html", description: "Nous contacter facilement" },
    { title: "Films", url: "/film.html", description: "Découvrez nos films" },
    { title: "Mon compte", url: "/profile.html", description: "Paramétre du compte" }
];

// Configuration de la recherche floue avec Fuse.js
const fuse = new Fuse(pages, {
    keys: ["title"],  // Recherche basée sur le titre uniquement
    threshold: 0.4    // Niveau de tolérance aux fautes (0 = strict, 1 = large)
});

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const filmsFile = 'films.json';

chokidar.watch(filmsFile).on('change', (event, path) => {
  console.log(`${path} a été modifié, redémarrage du serveur...`);

  setTimeout(() => {
    process.exit(0); // Redémarre le serveur après 2 secondes
  }, 2000); // 2000 ms = 2 secondes
});



// Charger les films depuis le fichier JSON au démarrage
let films = {};

// Vérifier si le fichier existe et le charger
if (fs.existsSync(filmsFile)) {
    const data = fs.readFileSync(filmsFile, 'utf8');
    films = JSON.parse(data);
} else {
    films = {}; // Si le fichier n'existe pas encore, initialiser un objet vide
}

app.use(express.json());
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

app.get("/search", (req, res) => {
    let query = req.query.q;
    if (!query) {
        return res.json([]);  // Aucune recherche effectuée
    }

    query = query.toLowerCase();
    let results = fuse.search(query).map(result => result.item); // Recherche floue

    res.json(results);
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

// Route pour récupérer la liste des films
app.get('/allfilmslist', (req, res) => {
    res.json(films);
});

// Route pour ajouter un film
app.post('/addFilm', (req, res) => {
    const { filmName, actors, director, summary, posterLink, filmLink } = req.body;

    if (!filmName || !actors || !director || !summary || !posterLink || !filmLink) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    films[filmName] = {
        filmName,
        actors: Array.isArray(actors) ? actors : actors.split(','),
        director,
        summary,
        posterLink,
        filmLink,
    };

    saveFilms();
    res.status(201).json({ message: `Le film "${filmName}" a été ajouté avec succès.` });
});

app.post('/updateFilm', (req, res) => {
    const { filmName, updatedFilm } = req.body;

    if (!films[filmName]) {
        return res.status(404).json({ error: 'Film non trouvé.' });
    }

    // Vérifier si le nom du film a changé
    const newFilmName = updatedFilm.filmName;

    if (newFilmName && newFilmName !== filmName) {
        // Supprimer l'ancienne entrée
        delete films[filmName];

        // Ajouter le film avec le nouveau nom
        films[newFilmName] = updatedFilm;
    } else {
        // Juste mettre à jour l'entrée existante
        films[filmName] = updatedFilm;
    }

    saveFilms();
    res.status(200).json({ message: 'Film mis à jour avec succès.' });
});

// Route pour supprimer un film
app.delete('/deleteFilm/:filmName', (req, res) => {
    const filmName = req.params.filmName;

    if (!films[filmName]) {
        return res.status(404).json({ error: 'Film non trouvé.' });
    }

    delete films[filmName];
    saveFilms();
    res.status(200).json({ message: `Le film "${filmName}" a été supprimé.` });
});


// Fonction pour sauvegarder les films dans le fichier JSON
function saveFilms() {
    fs.writeFileSync(filmsFile, JSON.stringify(films, null, 2), 'utf8');
}



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
      const carouselHTML = Object.keys(films).map(key => {
        const film = films[key];
        const filmName = film.filmName || film.filmName2 || key;
        return `
          <a href="https://geromstudio.glitch.me/films/film.html?film=${encodeURIComponent(filmName)}" class="carousel-item">
            <div class="image-container">
              <img src="${film.posterLink}" alt="Affiche" />
            </div>
            <div class="movie-title">${filmName}</div>
          </a>
        `;
      }).join("");

      const carouselContent = `
        <div> <h2 class="titrefilm">Nos Films </h2></div>
        <div class="carousel">
          ${carouselHTML}
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

app.post('/verify-unique-id', (req, res) => {
  const { uniqueId } = req.body;

  if (uniqueId === validUniqueId) {
    // Si uniqueId est valide, répondre avec un statut 200
    res.status(200).send('ID valide');
  } else {
    // Si uniqueId n'est pas valide, répondre avec un statut 403
    res.status(403).send('ID invalide');
  }
});

app.get('/filmslist', (req, res) => {
    fs.readFile(path.join(__dirname, 'films.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur de lecture du fichier films.json' });
        }
        const films = JSON.parse(data);
        res.json({ films });
    });
});

// Endpoint pour enregistrer l'ordre des films
app.post('/save-films-order', (req, res) => {
    const { filmsOrder, uniqueId } = req.body;

    // Vérifier si le uniqueId est valide
    if (uniqueId !== validUniqueId) {
        return res.status(403).json({ error: 'Accès interdit : uniqueId invalide' });
    }

    // Si uniqueId est valide, traiter l'ordre des films
    fs.readFile(path.join(__dirname, 'films.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur de lecture du fichier films.json' });
        }
        
        const films = JSON.parse(data);
        
        // Réorganiser les films selon filmsOrder (preservation des données)
        const reorderedFilms = {};
        filmsOrder.forEach(filmName => {
            if (films[filmName]) {
                reorderedFilms[filmName] = films[filmName];
            }
        });

        // Sauvegarder la nouvelle liste d'ordre
        fs.writeFile(path.join(__dirname, 'films.json'), JSON.stringify(reorderedFilms, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'ordre des films' });
            }
            res.json({ success: true });
        });
    });
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
