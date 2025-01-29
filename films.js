// films.js
import sqlite3 from 'sqlite3';
const db = new sqlite3.verbose().Database('data/films.db');

const films = {
    insertFilm: (filmData) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(
                    `INSERT INTO films (filmName, filmName2, director, summary, posterLink, filmLink) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        filmData.filmName,
                        filmData.filmName2,
                        filmData.director,
                        filmData.summary,
                        filmData.posterLink,
                        filmData.filmLink
                    ],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return resolve({
                                success: false,
                                error: "Erreur lors de l'insertion du film"
                            });
                        }

                        const filmId = this.lastID;
                        const actorPromises = filmData.actors.map(actorName => {
                            return new Promise((resolveActor) => {
                                // Insérer ou récupérer l'acteur
                                db.run(
                                    `INSERT OR IGNORE INTO actors (name) VALUES (?)`,
                                    [actorName],
                                    function(err) {
                                        if (err) {
                                            resolveActor(err);
                                            return;
                                        }
                                        
                                        // Récupérer l'ID de l'acteur
                                        db.get(
                                            `SELECT id FROM actors WHERE name = ?`,
                                            [actorName],
                                            (err, actor) => {
                                                if (err) {
                                                    resolveActor(err);
                                                    return;
                                                }

                                                // Lier l'acteur au film
                                                db.run(
                                                    `INSERT INTO film_actors (film_id, actor_id) 
                                                     VALUES (?, ?)`,
                                                    [filmId, actor.id],
                                                    (err) => {
                                                        resolveActor(err);
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            });
                        });

                        Promise.all(actorPromises)
                            .then((errors) => {
                                if (errors.some(err => err)) {
                                    db.run('ROLLBACK');
                                    resolve({
                                        success: false,
                                        error: "Erreur lors de l'ajout des acteurs"
                                    });
                                } else {
                                    db.run('COMMIT');
                                    resolve({
                                        success: true,
                                        message: "Film ajouté avec succès",
                                        filmId: filmId
                                    });
                                }
                            });
                    }
                );
            });
        });
    }
};

export default films;