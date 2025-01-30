const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class FilmDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, 'data/films.db');
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, async (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('Connecté à la base de données SQLite');
                
                try {
                    await this.initDatabase();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            console.log('Initialisation des tables...');
            
            const queries = [
                `CREATE TABLE IF NOT EXISTS films (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filmName TEXT NOT NULL,
                    filmName2 TEXT,
                    director TEXT,
                    summary TEXT,
                    posterLink TEXT,
                    filmLink TEXT
                );`,
                `CREATE TABLE IF NOT EXISTS actors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE
                );`,
                `CREATE TABLE IF NOT EXISTS film_actors (
                    film_id INTEGER,
                    actor_id INTEGER,
                    FOREIGN KEY (film_id) REFERENCES films (id) ON DELETE CASCADE,
                    FOREIGN KEY (actor_id) REFERENCES actors (id) ON DELETE CASCADE,
                    PRIMARY KEY (film_id, actor_id)
                );`
            ];

            this.db.serialize(() => {
                this.db.run('PRAGMA foreign_keys = ON');
                
                this.db.run('BEGIN TRANSACTION');
                
                for (const query of queries) {
                    this.db.run(query, (err) => {
                        if (err) {
                            this.db.run('ROLLBACK');
                            reject(err);
                            return;
                        }
                    });
                }
                
                this.db.run('COMMIT', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Tables créées avec succès');
                        resolve();
                    }
                });
            });
        });
    }

    async getFilmByName(filmName) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    f.*,
                    GROUP_CONCAT(DISTINCT a.name) as actors
                FROM films f
                LEFT JOIN film_actors fa ON f.id = fa.film_id
                LEFT JOIN actors a ON fa.actor_id = a.id
                WHERE f.filmName = ? OR f.filmName2 = ?
                GROUP BY f.id, f.filmName, f.filmName2, f.director, f.summary, f.posterLink, f.filmLink
            `;
            
            this.db.get(query, [filmName, filmName], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row) {
                    const filmData = {
                        ...row,
                        actors: row.actors ? row.actors.split(',') : []
                    };
                    resolve(filmData);
                } else {
                    resolve(null);
                }
            });
        });
    }

    async addFilm(filmData) {
        const requiredFields = ['filmName', 'filmName2', 'actors', 'director', 'summary', 'posterLink', 'filmLink'];
        for (const field of requiredFields) {
            if (!filmData[field]) {
                throw new Error(`Le champ ${field} est requis.`);
            }
        }

        const actors = Array.isArray(filmData.actors) ? filmData.actors : filmData.actors.split(',');

        return new Promise((resolve, reject) => {
            this.db.serialize(async () => {
                try {
                    this.db.run('BEGIN TRANSACTION');

                    // Insérer le film
                    const filmResult = await this.runAsync(
                        `INSERT INTO films (filmName, filmName2, director, summary, posterLink, filmLink)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [filmData.filmName, filmData.filmName2, filmData.director, 
                         filmData.summary, filmData.posterLink, filmData.filmLink]
                    );

                    const filmId = filmResult.lastID;

                    // Insérer les acteurs
                    for (const actorName of actors) {
                        const cleanedActorName = actorName.trim();
                        
                        // Insérer l'acteur s'il n'existe pas
                        await this.runAsync(
                            `INSERT OR IGNORE INTO actors (name) VALUES (?)`,
                            [cleanedActorName]
                        );

                        // Récupérer l'ID de l'acteur
                        const actorResult = await this.getAsync(
                            `SELECT id FROM actors WHERE name = ?`,
                            [cleanedActorName]
                        );

                        // Lier l'acteur au film
                        await this.runAsync(
                            `INSERT INTO film_actors (film_id, actor_id) VALUES (?, ?)`,
                            [filmId, actorResult.id]
                        );
                    }

                    await this.runAsync('COMMIT');
                    resolve({ filmId, filmName: filmData.filmName });
                } catch (error) {
                    await this.runAsync('ROLLBACK');
                    reject(error);
                }
            });
        });
    }

    // Méthodes utilitaires pour les promesses
    runAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    getAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close(err => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Connexion à la base de données fermée');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = new FilmDatabase();