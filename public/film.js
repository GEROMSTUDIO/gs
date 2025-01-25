document.addEventListener('DOMContentLoaded', () => {
    // Conteneur pour les films
    const filmContainer = document.getElementById('filmContainer');

    // Liste de films (vous pouvez remplacer par vos propres données)
    const films = [
        { 
            titre: 'Inception', 
            realisateur: 'Christopher Nolan', 
            annee: 2010,
            description: 'Un film de science-fiction sur le vol de secrets dans les rêves.'
        },
        { 
            titre: 'Matrix', 
            realisateur: 'Lana et Lilly Wachowski', 
            annee: 1999,
            description: 'Un film révolutionnaire sur la réalité virtuelle et la rébellion humaine.'
        },
        { 
            titre: 'Interstellar', 
            realisateur: 'Christopher Nolan', 
            annee: 2014,
            description: 'Un voyage spatial à la recherche d\'une nouvelle terre pour l\'humanité.'
        }
    ];

    // Fonction pour créer un élément de film
    function creerElementFilm(film) {
        const filmElement = document.createElement('div');
        filmElement.classList.add('film-item');
        filmElement.innerHTML = `
            <h3>${film.titre}</h3>
            <p><strong>Réalisateur:</strong> ${film.realisateur}</p>
            <p><strong>Année:</strong> ${film.annee}</p>
            <p>${film.description}</p>
            <button class="details-btn">Voir plus</button>
        `;

        // Ajout d'interactivité au bouton
        const detailsBtn = filmElement.querySelector('.details-btn');
        detailsBtn.addEventListener('click', () => {
            alert(`Détails de ${film.titre} :\n\n${film.description}`);
        });

        return filmElement;
    }

    // Fonction pour afficher les films
    function afficherFilms() {
        // Vider le conteneur
        filmContainer.innerHTML = '';

        // Ajouter chaque film
        films.forEach(film => {
            const filmElement = creerElementFilm(film);
            filmContainer.appendChild(filmElement);
        });
    }

    // Fonction pour ajouter un nouveau film
    function ajouterFilm() {
        const nouveauFilm = {
            titre: prompt('Entrez le titre du film :'),
            realisateur: prompt('Entrez le réalisateur :'),
            annee: parseInt(prompt('Entrez l\'année de sortie :')),
            description: prompt('Entrez une description :')
        };

        // Valider les données
        if (nouveauFilm.titre && nouveauFilm.realisateur && nouveauFilm.annee && nouveauFilm.description) {
            films.push(nouveauFilm);
            afficherFilms();
        } else {
            alert('Veuillez remplir tous les champs');
        }
    }

    // Créer un bouton pour ajouter des films
    const ajouterFilmBtn = document.createElement('button');
    ajouterFilmBtn.textContent = 'Ajouter un Film';
    ajouterFilmBtn.classList.add('ajouter-film-btn');
    ajouterFilmBtn.addEventListener('click', ajouterFilm);

    // Ajouter le bouton avant le conteneur de films
    filmContainer.parentNode.insertBefore(ajouterFilmBtn, filmContainer);

    // Afficher les films initiaux
    afficherFilms();
});