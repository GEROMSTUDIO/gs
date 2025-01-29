const sqlite3 = require('sqlite3').verbose();

// Créer ou ouvrir la base de données SQLite
const db = new sqlite3.Database('data/films.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('Base de données ouverte avec succès.');
  }
});

// Créer la table pour stocker les films
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS films (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filmName TEXT,
      filmName2 TEXT,
      actors TEXT,
      director TEXT,
      summary TEXT,
      posterLink TEXT,
      filmLink TEXT
    )
  `);
});

// Fonction pour insérer un film dans la base de données
const insertFilm = (film) => {
  const { filmName, filmName2, actors, director, summary, posterLink, filmLink } = film;
  
  const query = `
    INSERT INTO films (filmName, filmName2, actors, director, summary, posterLink, filmLink)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [filmName, filmName2, JSON.stringify(actors), director, summary, posterLink, filmLink], function(err) {
    if (err) {
      console.error('Erreur lors de l\'insertion du film:', err.message);
    } else {
      console.log(`Film ajouté avec succès, ID: ${this.lastID}`);
    }
  });
};

// Exemple de données pour un film
const filmData = {
    filmName: "La Grande Révélation",
    filmName2: "La Grande Révélation",
    actors: ["Hanna Bedhiaf, Baptiste Blache, Tristan Vaucheret Perrier..."],
    director: "Romain Lastella",
    summary: "Comme tous les matins Agatha se rendait au Collège mais aujourd'hui tous bascule...",
    posterLink: "https://i.ibb.co/h9X4Fb2/La-Grande-R-v-lation.webp",
    filmLink: "https://drive.google.com/file/d/1wdMp62bhBd7I0J0m_cW0fvpsdfeSBiCY/preview"
};

// Insérer un film dans la base de données
insertFilm(filmData);

// Fermer la base de données lorsque tout est terminé
db.close((err) => {
  if (err) {
    console.error('Erreur lors de la fermeture de la base de données:', err.message);
  } else {
    console.log('Base de données fermée avec succès.');
  }
});
