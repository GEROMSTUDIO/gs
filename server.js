const express = require('express');
const { getFilm } = require('./films');

const app = express();
const port = 3000;

app.get('/film/:filmName', (req, res) => {
    const filmName = req.params.filmName;

    getFilm(filmName, (err, film) => {
        if (err) {
            res.status(500).json({ error: "Erreur lors de la récupération du film" });
        } else if (film) {
            res.json(film);
        } else {
            res.status(404).json({ error: "Film non trouvé" });
        }
    });
});

app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
});