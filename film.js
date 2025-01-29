// films.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('films.db');

const films = {
    getFilmByName: (filmName) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT films.*, GROUP_CONCAT(actors.name) as actors
                 FROM films 
                 LEFT JOIN film_actors ON films.id = film_actors.film_id
                 LEFT JOIN actors ON film_actors.actor_id = actors.id
                 WHERE films.filmName = ?
                 GROUP BY films.id`,
                [filmName],
                (err, film) => {
                    if (err) {
                        return resolve({
                            success: false,
                            error: "Erreur lors de la récupération du film"
                        });
                    }
                    
                    if (!film) {
                        return resolve({
                            success: false,
                            error: "Film non trouvé"
                        });
                    }

                    // Convertir la chaîne d'acteurs en tableau
                    film.actors = film.actors ? film.actors.split(',') : [];
                    
                    resolve({
                        success: true,
                        film: {
                            filmName: film.filmName,
                            filmName2: film.filmName2,
                            actors: film.actors,
                            director: film.director,
                            summary: film.summary,
                            posterLink: film.posterLink,
                            filmLink: film.filmLink
                        }
                    });
                }
            );
        });
    }
};

module.exports = films;