const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const filmsFile = 'films.json';

// Charger les films depuis le fichier JSON au démarrage
let films = {};

// Vérifier si le fichier existe et le charger
if (fs.existsSync(filmsFile)) {
    const data = fs.readFileSync(filmsFile, 'utf8');
    films = JSON.parse(data);
} else {
    films = {}; // Si le fichier n'existe pas encore, initialiser un objet vide
}

// Route pour récupérer la liste des films
app.get('/films', (req, res) => {
    res.json(films);
});

// Route pour ajouter un film
app.post('/addFilm', (req, res) => {
    const { filmName, filmName2, actors, director, summary, posterLink, filmLink } = req.body;

    if (!filmName || !filmName2 || !actors || !director || !summary || !posterLink || !filmLink) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    films[filmName] = {
        filmName,
        filmName2,
        actors: Array.isArray(actors) ? actors : actors.split(','),
        director,
        summary,
        posterLink,
        filmLink,
    };

    saveFilms();
    res.status(201).json({ message: `Le film "${filmName}" a été ajouté avec succès.` });
});

// Route pour mettre à jour un film
app.post('/updateFilm', (req, res) => {
    const { filmName, updatedFilm } = req.body;

    if (!films[filmName]) {
        return res.status(404).json({ error: 'Film non trouvé.' });
    }

    films[filmName] = updatedFilm;
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

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
