const sqlite3 = require('sqlite3').verbose();

// Création de la base de données
const db = new sqlite3.Database('films.db', (err) => {
    if (err) {
        console.error("Erreur lors de l'ouverture de la base de données", err);
    } else {
        console.log('Base de données SQLite créée avec succès.');
    }
});

// Création de la table films
const createTable = `CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filmName TEXT,
    filmName2 TEXT,
    actors TEXT,
    director TEXT,
    summary TEXT,
    posterLink TEXT,
    filmLink TEXT
);`;

db.run(createTable, (err) => {
    if (err) {
        console.error('Erreur lors de la création de la table', err);
    } else {
        console.log('Table "films" créée avec succès.');
    }
});

// Fonction pour insérer un film
function insertFilm(film) {
    const query = `INSERT INTO films (filmName, filmName2, actors, director, summary, posterLink, filmLink) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [
        film.filmName,
        film.filmName2,
        JSON.stringify(film.actors), // Stocke les acteurs sous forme de chaîne JSON
        film.director,
        film.summary,
        film.posterLink,
        film.filmLink
    ], (err) => {
        if (err) {
            console.error("Erreur lors de l'insertion du film", err);
        } else {
            console.log(`Film "${film.filmName}" ajouté avec succès.`);
        }
    });
}

// Fonction pour récupérer un film par son nom
function getFilm(filmName, callback) {
    db.get("SELECT * FROM films WHERE filmName = ?", [filmName], (err, row) => {
        if (err) {
            callback(err, null);
        } else if (row) {
            row.actors = JSON.parse(row.actors); // Convertir la chaîne JSON en tableau
            callback(null, row);
        } else {
            callback(null, null);
        }
    });
}

module.exports = { insertFilm, getFilm };
